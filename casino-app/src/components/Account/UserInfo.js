import React, { useContext } from 'react';
import AccountContext from './AccountContext';

const UserInfo = () => {
    const { account } = useContext(AccountContext);

    if (!account) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>User Information</h2>
            <p>Username: {account.username}</p>
            <p>Balance: ${account.balance}</p>
            {/* Add more user information here if needed */}
        </div>
    );
};

export default UserInfo;
