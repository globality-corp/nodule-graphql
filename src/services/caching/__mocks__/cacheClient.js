import uuidv5 from 'uuid/v5';

const GLOBALITY_ID = '0cffbd9f-d9bd-4dbb-88fa-327ebaec1a4b';

function get(id) {
    if (id === uuidv5('user?id=get-error', GLOBALITY_ID)) {
        return Promise.reject(new Error());
    }

    if (id === uuidv5('user?id=no-data', GLOBALITY_ID) || id === uuidv5('user?id=set-error', GLOBALITY_ID)) {
        return new Promise(resolve => resolve(null));
    }

    return new Promise((resolve) => {
        const user = {
            companyId: 'client-id',
            companyName: 'Magical Provider',
            email: 'rw@hogwarts.edu',
            firstName: 'Ron',
            id,
            isMe: false,
            lastName: 'Weasley',
            thumbnailUrl: null,
            title: 'Project manager',
            role: 'user',
        };

        resolve(user);
    });
}

function add(id, data) {
    if (data.id === uuidv5('user?id=set-error', GLOBALITY_ID)) {
        return Promise.reject(new Error());
    }

    return new Promise(resolve => resolve(true));
}

const client = jest.mock();
client.get = get;
client.add = add;

export const createCacheClient = () => client;

export default { createCacheClient };
