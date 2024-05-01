import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const productsTableName = 'Products';
const stockTableName = 'Stocks';

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION_DEPLOY });
const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDB);

export async function main(event: any) {
  const getProductCommand = new GetCommand({
    TableName: productsTableName,
    Key: {
      id: event.productId,
    },
  });
  const getStockCommand = new GetCommand({
    TableName: stockTableName,
    Key: {
      product_id: event.productId,
    },
  });

  const product = await dynamoDBDocumentClient.send(getProductCommand);
  const stock = await dynamoDBDocumentClient.send(getStockCommand);

  const result = { ...product.Item, stock: stock.Item?.count };

  return result;
}
