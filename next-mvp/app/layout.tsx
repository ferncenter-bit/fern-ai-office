import type { Metadata } from "next";
export const metadata: Metadata = {title:"FERN AI OFFICE",description:"CEO Command Center"};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="th"><body style={{margin:0,fontFamily:"system-ui, sans-serif",background:"#f7f5ee",color:"#314036"}}>{children}</body></html>}
