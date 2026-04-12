from django.db import transaction
from django.utils import timezone
from items.models import FoundItem, LostItem
from matches.models import ItemMatch
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ItemClaim
from .permissions import IsClaimantOrStaff, IsStaff
from .serializers import ItemClaimCreateSerializer, ItemClaimSerializer


class ItemClaimViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ItemClaim.objects.select_related(
            "claimant",
            "verified_by",
            "match__lost_item__user",
            "match__found_item__user",
        ).all()
        user = self.request.user
        if not user.is_staff:
            qs = qs.filter(claimant=user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return ItemClaimCreateSerializer
        return ItemClaimSerializer

    def get_permissions(self):
        if self.action == "verify":
            return [permissions.IsAuthenticated(), IsStaff()]
        if self.action in ("retrieve",):
            return [permissions.IsAuthenticated(), IsClaimantOrStaff()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(
            claimant=self.request.user,
            verification_method=ItemClaim.ADMIN_REVIEW,
        )

    @action(detail=True, methods=["post"], url_path="verify")
    def verify(self, request, pk=None):
        claim = self.get_object()
        if claim.status != ItemClaim.PENDING:
            return Response(
                {"detail": "Only pending claims can be verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        decision = request.data.get("decision")
        if decision not in ("approved", "rejected"):
            return Response(
                {"detail": 'decision must be "approved" or "rejected".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        if decision == "rejected":
            with transaction.atomic():
                claim.status = ItemClaim.REJECTED
                claim.verified_by = request.user
                claim.verified_at = now
                claim.save(update_fields=["status", "verified_by", "verified_at"])
        else:
            match = claim.match
            with transaction.atomic():
                claim.status = ItemClaim.APPROVED
                claim.verified_by = request.user
                claim.verified_at = now
                claim.save(update_fields=["status", "verified_by", "verified_at"])

                ItemMatch.objects.filter(pk=match.pk).update(status=ItemMatch.CLAIMED)
                FoundItem.objects.filter(pk=match.found_item_id).update(
                    status=FoundItem.CLAIMED,
                )
                LostItem.objects.filter(pk=match.lost_item_id).update(
                    status=LostItem.RESOLVED,
                )

        fresh = self.get_queryset().get(pk=claim.pk)
        serializer = ItemClaimSerializer(fresh, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
