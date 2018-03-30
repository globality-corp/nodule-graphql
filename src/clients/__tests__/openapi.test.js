import { clearBinding, Nodule } from '@globality/nodule-config';

import spec from 'testing/petstore.json';
import { createOpenAPIClient, mockError, mockResponse } from 'index';


describe('createOpenAPIClient', () => {
    const REX = {
        id: '1',
        name: 'Rex',
    };

    beforeEach(() => {
        clearBinding('config');
    });

    it('supports mocking response', async () => {
        const config = await Nodule.testing().fromObject(
            mockResponse('petstore', 'pet.search', {
                items: [
                    REX,
                ],
            }),
        ).load();

        const client = createOpenAPIClient('petstore', spec);

        const result = await client.pet.search();
        expect(result).toEqual({
            items: [
                REX,
            ],
        });

        expect(config.clients.mock.petstore.pet.search).toHaveBeenCalledTimes(1);
        expect(config.clients.mock.petstore.pet.search.mock.calls[0][0].headers).toMatchObject({
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json; charset=utf-8',
            'X-Request-Service': 'test',
        });
    });

    it('supports mocking errors', async () => {
        const config = await Nodule.testing().fromObject(
            mockError('petstore', 'pet.search', 'Not Found', 404),
        ).load();

        const client = createOpenAPIClient('petstore', spec);

        await expect(client.pet.search()).rejects.toThrow(
            'Not Found',
        );

        expect(config.clients.mock.petstore.pet.search).toHaveBeenCalledTimes(1);
    });

    it('raises an error if not mocked', async () => {
        const client = createOpenAPIClient('petstore', spec);

        await expect(client.pet.search()).rejects.toThrow(
            'OpenAPI operation petstore.pet.search is not mocked',
        );
    });
});
