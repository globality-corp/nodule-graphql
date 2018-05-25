import dedup from '../wrapper';

let mockConfig = {};
jest.mock('@globality/nodule-config', () => ({
    bind: (key, value) => {
        mockConfig[key] = value;
        return mockConfig;
    },
    getContainer: () => mockConfig,
    clearBinding: () => {
        mockConfig = {};
    },
    getConfig: () => 10,
}));

let req;
let companyRetrieve;

describe('dataLoader wrapper', () => {
    beforeEach(() => {
        companyRetrieve = jest.fn(async (_, { id }) => ({ id }));
        req = {
            app: {
                config: {
                },
            },
        };
    });

    it('should use in-req cache', async () => {
        const wrapper = dedup(companyRetrieve, {});
        let company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);

        company = await wrapper(req, { id: 2 });
        expect(company.id).toBe(2);
        expect(companyRetrieve).toHaveBeenCalledTimes(2);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 2,
        });
    });

    it('should allow to access the loader object', async () => {
        const wrapper = dedup(companyRetrieve, { loaderName: 'companyLoader' });
        let company = await wrapper(req, { id: 1 });
        expect(company.id).toBe(1);
        expect(companyRetrieve).toHaveBeenCalledTimes(1);
        expect(companyRetrieve).toHaveBeenLastCalledWith(req, {
            id: 1,
        });

        // DataLoader api
        mockConfig = {};

        company = await wrapper(req, { id: 1 });
        expect(companyRetrieve).toHaveBeenCalledTimes(2);
        expect(company.id).toBe(1);

    });

});
