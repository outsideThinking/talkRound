import React from "react";
import { APP_META } from "../data/appData";

const Footer = () => {
  return (
    <div className="text-center text-xs text-gray-400 mt-6">
      {APP_META.footerNote}
    </div>
  );
};

export default Footer;
