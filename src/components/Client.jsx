import React, { memo } from 'react';
import Avatar from 'react-avatar';

const Client = memo(({ username }) => {
    console.log(`Rendering client: ${username}`);
    return (
        <div className="client">
            <Avatar name={username} size={50} round="14px" />
            <span className="userName">{username}</span>
        </div>
    );
});

Client.displayName = 'Client';

export default Client;