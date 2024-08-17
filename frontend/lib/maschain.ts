
export const creatMaschainWallet = async (data:any) => {    
    let response = await fetch(`${import.meta.env.VITE_APP_MASCHAIN_API_URL}api/wallet/create-user`,
    {
        method: "POST",
        headers: {
            client_id: import.meta.env.VITE_APP_MASCHAIN_CLIENT_ID,
            client_secret: import.meta.env.VITE_APP_MASCHAIN_CLIENT_SECRET,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
}