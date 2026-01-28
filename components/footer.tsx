'use client';

import { InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on mobile pages
    const isMobilePage = ['/dashboard', '/review', '/login', '/register'].includes(pathname);
    if (isMobilePage) {
        return null;
    }

    return null;

    // return (
    //     <footer className="bg-gray-50 border-t border-gray-200">
    //         <div className="max-w-md md:max-w-4xl mx-auto px-4 py-12">
    //             <div className="flex flex-col md:flex-row items-start justify-between gap-8">
    //                 <div className="max-w-xs">
    //                     <Image
    //                         src="/assets/logo-colored.svg"
    //                         alt="Manabou Logo"
    //                         width={135}
    //                         height={35}
    //                         className="h-9 mb-4"
    //                     />
    //                     <p className="text-gray-600 text-sm">
    //                         Stay consistent. Study a little every day.
    //                     </p>
    //                 </div>
    //                 <div>
    //                     <p className="uppercase font-semibold text-blue-600 text-sm mb-4">Social</p>
    //                     <div className="flex flex-col gap-3">
    //                         <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
    //                             <TwitterIcon size={20} />
    //                             <span className="text-sm">Twitter</span>
    //                         </a>
    //                         <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
    //                             <LinkedinIcon size={20} />
    //                             <span className="text-sm">LinkedIn</span>
    //                         </a>
    //                         <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
    //                             <InstagramIcon size={20} />
    //                             <span className="text-sm">Instagram</span>
    //                         </a>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
    //                 © {new Date().getFullYear()} Manabou. All rights reserved.
    //             </div>
    //         </div>
    //     </footer>
    // );
}
