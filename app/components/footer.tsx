import { Link } from "@remix-run/react";
import Middot from "./middot";

export type Props = {
  version?: string;
  admin?: boolean;
};

export default function Footer({ version, admin }: Props) {
  return (
    <div className="flex justify-between text-xs text-secondary-light dark:text-secondary-dark">
      <div>
        <span>Vanguard {version ? version.substring(0, 7) : ""}</span>{" "}
        <Middot />{" "}
        <Link
          to="/about"
          className="text-link-light dark:text-link-dark hover:underline"
        >
          About
        </Link>
      </div>
      <div>
        {admin && (
          <>
            <Link
              className="text-link-light dark:text-link-dark hover:underline"
              to="/admin"
            >
              Admin
            </Link>{" "}
            <Middot />{" "}
          </>
        )}
        <span>
          <a
            href="https://github.com/getsentry/vanguard"
            className="text-link-light dark:text-link-dark hover:underline"
          >
            GitHub
          </a>
        </span>
      </div>
    </div>
  );
}
