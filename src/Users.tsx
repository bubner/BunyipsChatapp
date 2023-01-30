/**
 *    User presence manager for client information, and user count dialogues.
 *    @author Lucas Bubner, 2023
 */
import { UserData, auth } from "./Firebase";
import "./Users.css";

function Users({ online, offline }: { online: Array<UserData>; offline: Array<UserData> }) {
    /*
        Elements TODO:
            > PFP display div, that will display the users that are online. If there are more than a set amount, display a few but have a +x of the extra people online
            > Popup div with extended information, including last seen date, and a list of the people who are here. Make it one list with all users on it, but those
            online should be at the top of the list.
            Do not show the current user on the pfp display div.
            Add a user button regardless of the state of other users next to the primary pfp to access user list.
    */
   
    return (
        <>
            <div className="userPfps">
                {online.map((user) => {
                    if (user.uid === auth.currentUser?.uid) return;
                    return <img src={user.pfp} key={user.uid} alt={user.name} title={user.name} />;
                })}
                <div className="backupname">
                    <b>Bunyips Chatapp</b>
                    <br />
                    {online.length} user(s) online
                </div>
            </div>
            {online.length > 8 && <div className="extrausers">+{online.length - 8}</div>}
            {online.length === 1 && <button className="onlyuser" />}
        </>
    );
}

export default Users;
