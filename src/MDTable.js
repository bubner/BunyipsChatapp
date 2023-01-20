/**
 *    Notes: Why do 2 empty tags fix all my problems
 *    @author Lachlan Paul, 2023
 */

import Popup from "reactjs-popup";
import "./MDTable.css"
import reactMarkdown from "react-markdown";

function MDTable() {
return(
    <Popup trigger={<button className="bbqitem">Markdown Commands</button>} nested>
{(close) => (
    <>
    <div className="mdouter" onClick={close} />
    <div className="mdinner" onClick={close} >
    
        <table>
        <tr>
            <th>Element</th>
            <th>When typing message</th>
            <th>Result</th>
        </tr>
        <tr>
            <td>Heading 1</td>
            <td># Heading 1</td>
            <td>Big Text</td>
        </tr>
        <tr>
            <td>Heading 2</td>
            <td>## Heading 2</td>
            <td></td>
        </tr>
        <tr>
            <td>Heading 3</td>
            <td>### Heading 3</td>
            <td></td>
        </tr>
        <tr>
            <td>Heading 4</td>
            <td>#### Heading 4</td>
            <td></td>
        </tr>
        <tr>
            <td>Heading 5</td>
            <td>##### Heading 5</td>
            <td></td>
        </tr>
        <tr>
            <td>Heading 6</td>
            <td>###### Heading 6</td>
            <td></td>
        </tr>
        <tr>
            <td>Bold Letters</td>
            <td>A **bold** word</td>
            <td></td>
        </tr>
        <tr>
            <td>Italics</td>
            <td>But *maybe*</td>
            <td></td>
        </tr>
        <tr>
            <td>Inline Code</td>
            <td>`print ("Hello World!")</td>
            <td></td>
        </tr>
        <tr>
            <td>Code Block</td>
            <td>```
                print("Input your name!")
                input()
                ```
            </td>
            <td></td>
        </tr>
        <tr>
            <td>Horizontal Line</td>
            <td>---Line---</td>
            <td></td>
        </tr>
        <tr>
            <td>Strikethrough</td>
            <td>~~Help~~</td>
            <td></td>
        </tr>
        </table> 
        </div>
        </>
)
}
    </Popup>
)
}


export default MDTable;