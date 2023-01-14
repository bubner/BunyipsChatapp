/**
 *    Hamburger menu part of the Navbar containing various options.
 *    @author Lachlan Paul, 2023
 */

import Popup from "reactjs-popup";
import "./BBQ.css";

function BBQ() {
    return (
        <Popup trigger={<svg className="bbqbtn" />}>
            <div className="outwin">
                <div className="inwin">
                    Sunao ni I LOVE YOU! todokeyou kitto YOU LOVE ME! tsutawaru
                    sa Kimi ni niau GLASS no kutsu wo sagasou Futari de STEP &
                    GO! itsu made mo Shin'ya juuni-ji wo sugitatte bokura no
                    LOVE MAGIC wa toke wa shinai Oide meshimase ohime-sama Doku
                    no ringo wo tabete nemucchai sou na Sunao sugiru kimi ga
                    totemo itoshii Atarimae ＝ (iko) takaramono sa Chikyuu wa
                    mawari hi wa nobori Kimi wa hohoemu Sunao ni I LOVE YOU!
                    todokeyou Kitto YOU LOVE ME! tsutawaru sa Kimi ni niau GLASS
                    no kutsu wo sagasou
                </div>
            </div>
        </Popup>
    );
}

export default BBQ;

/* 
    "I could go for a BBQ bacon burger,
    and a large order of fries,
    and an orange soda with no ice, and a piece of hot apple pie."

    Man, I miss Burger Tank!
 */
