import React from "react";
// import "../../Style/Footer.css";
import "../../../Style/Footer.css";
import { FaCopyright } from "react-icons/fa";

function Footer() {
  const currentdate = new Date();

  const year = currentdate.getFullYear();

  return (
    <div>
      <footer>
        <div className="copyright">
          <h5>
            <FaCopyright className="fa fa-copyright" />
            {year}Ngana Tech
          </h5>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
