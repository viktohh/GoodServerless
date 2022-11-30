import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
//import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodosAcess');
const attachmentUtils = new AttachmentUtils();
const todosAcess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos for user function called')
    return todosAcess.getAllTodos(userId)
}
//create todo function

export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string

): Promise<TodoItem> {
    logger.info('Create a todo function called')

    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
   // const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        //s3AttachmentUrl: s3AttachmentUrl,
        ...newTodo
    }

    return await todosAcess.createTodoItem(newItem)
}

//padate to do function

export async function updateTodo(
    todoId:string,
    todoUpdate: UpdateTodoRequest,
    userId:string
):      Promise<TodoUpdate> {
    logger.info('Update to function called')
    return  todosAcess.updateTodoItem(todoId,userId, todoUpdate)
}

//delete

export async function deleteTodo(
    todoId:string,
    userId:string,
    
):      Promise<string> {
    logger.info('Update to function called')
    return  todosAcess.deleteTodoItem(todoId,userId)
}

//attachment function

export async function createAttachmentPresignedUrl(
    todoId:string,
    userId:string,
    
):      Promise<string> {
    logger.info('create attachment function called by user', userId, todoId)
    return  attachmentUtils.getUploadUrl(todoId)
}