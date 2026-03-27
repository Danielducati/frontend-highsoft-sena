import { NewsPage } from "./pages/newsPage";

interface NewsModuleProps {
  userRole: "admin" | "employee" ;
}

export function NewsModule({ userRole }: NewsModuleProps) {
  return <NewsPage userRole={userRole} />;
}