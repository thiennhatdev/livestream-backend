"use strict";

const _ = require("lodash");
const utils = require("@strapi/utils");
const { getService } = require("@strapi/plugin-users-permissions/server/utils");
const {
  validateForgotPasswordBody,
} = require("@strapi/plugin-users-permissions/server/controllers/validation/auth");

const { getAbsoluteAdminUrl, getAbsoluteServerUrl, sanitize } = utils;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

function betweenRandomNumber(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
  }

module.exports = (plugin) => {
  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/auth/forgot-password-mobile",
    handler: "auth.forgotPasswordMobile",
    config: {
      middlewares: ["plugin::users-permissions.rateLimit"],
      prefix: "",
    },
  });

  plugin.controllers.auth.forgotPasswordMobile = async (ctx) => {
    
    const { email } = await validateForgotPasswordBody(ctx.request.body, 'Error validate forgot password!');
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });
    const emailSettings = await pluginStore.get({ key: "email" });
    const advancedSettings = await pluginStore.get({ key: "advanced" });

    // Find the user by email.
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: email.toLowerCase() } });

    if (!user || user.blocked) {
      return ctx.send({ ok: true });
    }
    console.log("start custom controller2");
    // Generate random token.
    const userInfo = await sanitizeUser(user, ctx);

    const resetPasswordToken = betweenRandomNumber(100000, 999999).toString(); //crypto.randomBytes(3).toString("hex");

    const resetPasswordSettings = _.get(
      emailSettings,
      "reset_password.options",
      {}
    );
    const emailBody = await getService("users-permissions").template(
      resetPasswordSettings.message,
      {
        URL: advancedSettings.email_reset_password,
        SERVER_URL: getAbsoluteServerUrl(strapi.config),
        ADMIN_URL: getAbsoluteAdminUrl(strapi.config),
        USER: userInfo,
        TOKEN: resetPasswordToken,
      }
    );

    const emailObject = await getService("users-permissions").template(
      resetPasswordSettings.object,
      {
        USER: userInfo,
      }
    );

    const emailToSend = {
      to: user.email,
      from:
        resetPasswordSettings.from.email || resetPasswordSettings.from.name
          ? `${resetPasswordSettings.from.name} <${resetPasswordSettings.from.email}>`
          : undefined,
      replyTo: resetPasswordSettings.response_email,
      subject: emailObject,
      text: emailBody,
      html: emailBody,
    };

    // NOTE: Update the user before sending the email so an Admin can generate the link if the email fails
    await getService("user").edit(user.id, { resetPasswordToken });

    // Send an email to the user.
    await strapi.plugin("email").service("email").send(emailToSend);

    ctx.send({ ok: true });
  };

  return plugin;
};