
module.exports = ({ env }) => {
  let arr2 = [];
  return ({

    // ...
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('MAIL_HOST'),
          port: env('MAIL_PORT'),
          auth: {
            user: env('MAIL_USERNAME'),
            pass: env('MAIL_PASSWORD'),
          },
          pool: true,
          logger: true,
          debug: true,
          maxConnections: 10000,
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
        },
  
        settings: {
          defaultFrom: env('MAIL_USERNAME'),
          defaultReplyTo: env('MAIL_USERNAME'),
        },
      },
    },
    // ...
    // "io": {
    //   "enabled": true,
    //   "config": {
    //     "IOServerOptions": {
    //       "cors": {
    //         "origin": "*",
    //         "methods": ["GET"],
    //       },
    //     },
    //     "events": [
    //       {
    //         "name": "connection",
    //         "handler": ({ strapi }, socket) => {

    //           strapi.log.info(`[io] new connection with id ${socket.id} --- `);

    //           socket.on('disconnect', () => {
                
    //           })
    //         },
    //       },
    //       {
    //         "name": "like",
    //         "handler": async ({ strapi }, socket) => {
    //           let data = socket;
    //           delete data.token;
    //           let userReceiveNoti = arr2.find(item => item.userId == data.toUserId); // thay bằng toUserId
    //           let res = await strapi.entityService.create('api::notification.notification', {
    //             data,
    //             populate: {
    //               imageId: {
    //                 populate: "*"
    //               },
    //               commentId: {
    //                 populate: "*"
    //               },
    //               toUserId: {
    //                 populate: "*"
    //               },
    //               fromUserId: {
    //                 populate: "*"
    //               }
    //             }
    //           });

    //           if (userReceiveNoti) {
    //             strapi.$io.raw("receiveNoti", res, {
    //               room: userReceiveNoti.socketId
    //             });
    //           }
    //         },
    //       },
    //       {
    //         "name": "verifyToken",
    //         "handler": async ({ strapi }, socket) => {
    //           try {
    //             const validToken = await strapi.plugins[
    //               'users-permissions'
    //             ].services.jwt.verify(socket.token);

    //             if (!validToken) {
    //               socket.disconnect();
    //             }

    //             arr2 = arr2.filter(item => item.userId != validToken['id'])

    //             arr2.push({
    //               socketId: socket.socketId,
    //               userId: validToken['id']
    //             })
    //           } catch (error) {
    //           }
    //         }
    //       },
    //     ]
    //   },
    // },
  })
};