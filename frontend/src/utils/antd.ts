import { message as antdMessage, notification as antdNotification, Modal as antdModal } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import type { HookAPI as ModalHookAPI } from 'antd/es/modal/useModal';
import { App } from 'antd';

let message: MessageInstance = antdMessage;
let notification: NotificationInstance = antdNotification;
let modal: ModalHookAPI = antdModal as unknown as ModalHookAPI;

export const AntdGlobalHelper = () => {
  const app = App.useApp();
  message = app.message;
  notification = app.notification;
  modal = app.modal;
  return null;
};

export { message, notification, modal };
