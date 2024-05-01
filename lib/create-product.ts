import { Handler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION_DEPLOY });
const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDB);
const productsTableName = 'Products';
const stockTableName = 'Stocks';

export const main: Handler = async ({ title, description, price, count }) => {
  const id = uuidv4();
  const productItem = { id, title, description, price };
  const stockItem = { product_id: id, count };

  const command = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          Item: productItem,
          TableName: productsTableName,
        },
      },
      {
        Put: {
          Item: stockItem,
          TableName: stockTableName,
        },
      },
    ],
  });

  await dynamoDBDocumentClient.send(command);

  const result = await dynamoDB.send(command);

  console.log('PutItem succeeded:', JSON.stringify(result, null, 2));

  return result;
};
