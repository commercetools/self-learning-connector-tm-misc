import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { readConfiguration } from '../utils/config.utils';
import { ApiRoot, Channel } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';


const CART_UPDATE_EXTENSION_KEY = 'free-sample-cartUpdateExtension';
const CART_DISCOUNT_TYPE_KEY = 'myconnector-cartDiscountType';

  

export async function createChannel(
  // apiRoot: ByProjectKeyRequestBuilder
): Promise<string> {

  const freeSampleChannelKey:string = readConfiguration().freeSampleChannel;
  let channel: Channel;
  let apiRoot = createApiRoot();
  const {
    body: { results: channels },
  } = await apiRoot
    .channels()
    .get({
      queryArgs: {
        where: `key = "${freeSampleChannelKey}"`,
      },
    })
    .execute();

  if (channels.length > 0) {
    channel = channels[0];
  } else {
    channel = await apiRoot
      .channels()
      .post({
        body: {
          key: freeSampleChannelKey,
          name: {
            en: 'Free Sample Supply Control Channel',
          },
          roles: ["InventorySupply"]
        },
      })
      .execute().then(channel => channel.body);
  }
  return channel.id;
}

export async function addInventory(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {

  const freeSampleSku:string = readConfiguration().freeSampleSku;
  const freeSampleQuantity: number = readConfiguration().freeSampleQuantity;
  const freeSampleInventoryKey = "free-sample-" + freeSampleSku;
  
  const {
    body: { results: inventories },
  } = await apiRoot
    .inventory()
    .get({
      queryArgs: {
        where: `key = "${freeSampleInventoryKey}"`,
      }
    })
    .execute();

  if (inventories.length > 0) {
    var inventory = inventories[0];
    await apiRoot
    .inventory()
    .withId({ID: inventory.id})
    .post(
      {body: {
        version: inventory.version,
        actions: [{
          action: "addQuantity",
          quantity: freeSampleQuantity
        }]
      }}
    )
    .execute();
  } else {
      await createChannel().then(channelId => apiRoot
        .inventory()
        .post(
          {
            body: {
              sku: freeSampleSku,
              quantityOnStock: freeSampleQuantity,
              supplyChannel: {typeId: "channel", id: channelId},
              key: freeSampleInventoryKey
            }
          }
        )
        .execute())
  }
}

export async function createCartUpdateExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  applicationUrl: string
): Promise<void> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${CART_UPDATE_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: CART_UPDATE_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }

  await apiRoot
    .extensions()
    .post({
      body: {
        key: CART_UPDATE_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: applicationUrl,
        },
        triggers: [
          {
            resourceTypeId: 'cart',
            actions: ['Update'],
          },
        ],
      },
    })
    .execute();
}

export async function deleteCartUpdateExtension(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${CART_UPDATE_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: CART_UPDATE_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }
}

export async function createCustomCartDiscountType(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: types },
  } = await apiRoot
    .types()
    .get({
      queryArgs: {
        where: `key = "${CART_DISCOUNT_TYPE_KEY}"`,
      },
    })
    .execute();

  if (types.length > 0) {
    const type = types[0];

    await apiRoot
      .types()
      .withKey({ key: CART_DISCOUNT_TYPE_KEY })
      .delete({
        queryArgs: {
          version: type.version,
        },
      })
      .execute();
  }

  await apiRoot
    .types()
    .post({
      body: {
        key: CART_DISCOUNT_TYPE_KEY,
        name: {
          en: 'Custom type to store a string',
        },
        resourceTypeIds: ['cart-discount'],
        fieldDefinitions: [
          {
            type: {
              name: 'String',
            },
            name: 'customCartField',
            label: {
              en: 'Custom cart field',
            },
            required: false,
          },
        ],
      },
    })
    .execute();
}
export const channelId = createChannel();