import { clientEnv } from "@/common/env/env.client";

export const DevOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (clientEnv.NODE_ENV === "production") return null;
    return <>{children}</>;
};
