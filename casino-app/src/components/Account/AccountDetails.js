import React, { useContext } from 'react';
import AccountContext from './AccountContext';

const AccountDetails = () => {
    const { account } = useContext(AccountContext);

    if (!account) {
        return <p>No account information available</p>;
    }

    return (
        <div>
            <h2>Account Details</h2>
            <p>Username: {account.username}</p>
            <p>Balance: ${account.balance}</p>
            {/* Display other account details as needed */}
        </div>
    );
};

export default AccountDetails;
