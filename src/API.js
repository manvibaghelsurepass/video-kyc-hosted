//This is the Auth token, you will use it to generate a meeting and connect to it
export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI3MzYzZWMzNS0zN2FmLTRkZmQtYmMyMi1lM2ExOTlmZjAxNzgiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyNTQ1NzYxOSwiZXhwIjoxODgzMjQ1NjE5fQ.Z0zpD34X2sx12qHR_Z_GyP_8du2_wH3eXXmXWJpDi4M";
// API call to create a meeting
export const createMeeting = async ({ token }) => {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
        method: "POST",
        headers: {
            authorization: `${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });
    //Destructuring the roomId from the response
    const { roomId } = await res.json();
    return roomId;
};