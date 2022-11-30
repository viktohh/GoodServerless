import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) {}
    
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get all todos function called')
    
        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
            ':userId': userId
            }
        })
        .promise()
    
        const items = result.Items
        return items as TodoItem[]
    }
    
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo item function called')
    
        const result = await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()
        logger.info('Todo item created', result)
    
        return todoItem as TodoItem
    }
    
    async updateTodoItem(
        todoId: string, 
        userId: string,
        todoUpdate: TodoUpdate
        ):Promise<TodoUpdate>{
            logger.info('Update function called by User')

            /**
             * Create an update expression that adds todoUpdate poperties if they exist
             */
            const updateExpression = 'set ' + Object.keys(todoUpdate).map(key => `#${key} = :${key}`).join(', ')
            const expressionAttributeNames = Object.keys(todoUpdate).reduce((acc, currkey) => {
                acc[`#${currkey}`] = currkey
                return acc;
            }, {})
            const expressionAttributeValues = Object.keys(todoUpdate).reduce((acc, currkey) => {
                acc[`:${currkey}`] = todoUpdate[currkey]
                return acc;
            }, {})


            const result = await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            })
            .promise()
            

            const updateTodoItem = result.Attributes
            logger.info('Todo Item updated', updateTodoItem)
            return updateTodoItem as TodoUpdate
           

    } 
    
    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('Delete todo item function called')
    
        const result = await this.docClient
        .delete({
            TableName: this.todosTable,
            Key: {
            todoId,
            userId
            }
        })
        .promise()
        logger.info('Todo item deleted', result)
        return todoId as string
    }
    
    // async updateTodoAttachmentUrl(
    //     todoId: string,
    //     userId: string,
    //     attachmentUrl: string
    // ): Promise<void> {
    //     logger.info('Update todo attachment url function called')
    
    //     await this.docClient
    //     .update({
    //         TableName: this.todosTable,
    //         Key: {
    //         todoId,
    //         userId
    //         },
    //         UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    //         ExpressionAttributeValues: {
    //         ':attachmentUrl': attachmentUrl
    //         }
    //     })
    //     .promise()
    // }

}