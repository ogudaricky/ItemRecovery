"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report-lost", label: "Report Lost Item" },
  { href: "/report-found", label: "Report Found Item" },
  { href: "/matches", label: "Possible Matches" },
  { href: "/claims", label: "Claims" },
  { href: "/notifications", label: "Notifications" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap gap-2 text-sm">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-lg px-3 py-2 transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/80 bg-background/70 text-foreground hover:border-primary/40 hover:text-primary",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
