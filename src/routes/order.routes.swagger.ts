/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gerenciamento de pedidos
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Criar novo pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lab
 *               - patient
 *               - customer
 *               - services
 *             properties:
 *               lab:
 *                 type: string
 *                 example: Lab XYZ
 *               patient:
 *                 type: string
 *                 example: João Silva
 *               customer:
 *                 type: string
 *                 example: Cliente ABC
 *               services:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - value
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Exame de sangue
 *                     value:
 *                       type: number
 *                       example: 100.50
 *                     status:
 *                       type: string
 *                       enum: [PENDING, DONE]
 *                       default: PENDING
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [CREATED, ANALYSIS, COMPLETED]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /api/orders/{id}/advance:
 *   patch:
 *     summary: Avançar estado do pedido
 *     tags: [Orders]
 *     description: Avança o estado do pedido (CREATED -> ANALYSIS -> COMPLETED). Para avançar para COMPLETED, todos os serviços devem estar DONE.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Estado avançado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *       400:
 *         description: Pedido já está no estado final ou há serviços pendentes
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /api/orders/{orderId}/services/{serviceIndex}:
 *   patch:
 *     summary: Atualizar status de um serviço
 *     tags: [Orders]
 *     description: Atualiza o status de um serviço específico do pedido
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *       - in: path
 *         name: serviceIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Índice do serviço (começa em 0)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, DONE]
 *                 example: DONE
 *     responses:
 *       200:
 *         description: Status do serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *       400:
 *         description: Índice do serviço inválido
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Deletar pedido (soft delete)
 *     tags: [Orders]
 *     description: Marca o pedido como DELETED (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *       400:
 *         description: Pedido já está deletado
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Não autenticado
 */
