import { InstanceDto } from '@api/dto/instance.dto';
import {
  SendAudioDto,
  SendButtonsDto,
  SendContactDto,
  SendListDto,
  SendLocationDto,
  SendMediaDto,
  SendPollDto,
  SendPtvDto,
  SendReactionDto,
  SendStatusDto,
  SendStickerDto,
  SendTemplateDto,
  SendTextDto,
} from '@api/dto/sendMessage.dto';
import { WAMonitoringService } from '@api/services/monitor.service';
import { Logger } from '@config/logger.config';
import { BadRequestException } from '@exceptions';
import { isBase64, isURL } from 'class-validator';
import emojiRegex from 'emoji-regex';

const regex = emojiRegex();

function isEmoji(str: string) {
  if (str === '') return true;

  const match = str.match(regex);
  return match?.length === 1 && match[0] === str;
}

export class SendMessageController {
  constructor(private readonly waMonitor: WAMonitoringService) { }

  private readonly logger = new Logger('SendMessageController');

  private isReadyInstance(instance: any) {
    if (!instance || !instance.client) {
      return false;
    }

    const state = instance.connectionStatus?.state;
    if (state === 'open') {
      return true;
    }

    return instance.client?.ws?.readyState === 1;
  }

  private async waitForOpen(instance: any, timeoutMs: number) {
    return await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        clearInterval(interval);
        resolve(false);
      }, timeoutMs);

      const interval = setInterval(() => {
        if (this.isReadyInstance(instance)) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve(true);
        }
      }, 500);
    });
  }

  private async getInstance(instanceName: string) {
    let instance = this.waMonitor.waInstances[instanceName];
    if (!instance) {
      instance = await this.waMonitor.loadInstanceByName(instanceName);
    }

    if (!instance) {
      throw new BadRequestException(`The "${instanceName}" instance is not connected`);
    }

    const state = instance.connectionStatus?.state;
    const isConnecting = state === 'connecting';
    const waitTimeout = isConnecting ? 90000 : 60000;
    const canConnect = typeof instance.connectToWhatsapp === 'function';
    const needsConnect =
      canConnect &&
      (!instance.client || state === 'close' || !state || (state === 'open' && !this.isReadyInstance(instance)));

    if (!this.isReadyInstance(instance)) {
      if (needsConnect) {
        try {
          await instance.connectToWhatsapp();
        } catch (error) {
          this.logger.warn(`Instance "${instanceName}" connectToWhatsapp failed: ${error?.message ?? error}`);
        }
      }

      let connected = await this.waitForOpen(instance, waitTimeout);
      if (!connected && canConnect) {
        const currentState = instance.connectionStatus?.state;
        this.logger.info(`Retrying connectToWhatsapp for instance "${instanceName}" after initial wait, currentState=${currentState}`);
        try {
          await instance.connectToWhatsapp();
        } catch (error) {
          this.logger.warn(`Instance "${instanceName}" retry connectToWhatsapp failed: ${error?.message ?? error}`);
        }
        connected = await this.waitForOpen(instance, waitTimeout);
      }

      if (!connected) {
        this.logger.warn(`Instance "${instanceName}" not opened after connect attempt, current state=${instance.connectionStatus?.state}`);
        throw new BadRequestException(`The "${instanceName}" instance is not connected`);
      }
    }

    return instance;
  }

  public async sendTemplate({ instanceName }: InstanceDto, data: SendTemplateDto) {
    return await (await this.getInstance(instanceName)).templateMessage(data);
  }

  public async sendText({ instanceName }: InstanceDto, data: SendTextDto) {
    return await (await this.getInstance(instanceName)).textMessage(data);
  }

  public async sendMedia({ instanceName }: InstanceDto, data: SendMediaDto, file?: any) {
    if (isBase64(data?.media) && !data?.fileName && data?.mediatype === 'document') {
      throw new BadRequestException('For base64 the file name must be informed.');
    }

    if (file || isURL(data?.media) || isBase64(data?.media)) {
      return await (await this.getInstance(instanceName)).mediaMessage(data, file);
    }
    throw new BadRequestException('Owned media must be a url or base64');
  }

  public async sendPtv({ instanceName }: InstanceDto, data: SendPtvDto, file?: any) {
    if (file || isURL(data?.video) || isBase64(data?.video)) {
      return await (await this.getInstance(instanceName)).ptvMessage(data, file);
    }
    throw new BadRequestException('Owned media must be a url or base64');
  }

  public async sendSticker({ instanceName }: InstanceDto, data: SendStickerDto, file?: any) {
    if (file || isURL(data.sticker) || isBase64(data.sticker)) {
      return await (await this.getInstance(instanceName)).mediaSticker(data, file);
    }
    throw new BadRequestException('Owned media must be a url or base64');
  }

  public async sendWhatsAppAudio({ instanceName }: InstanceDto, data: SendAudioDto, file?: any) {
    if (file?.buffer || isURL(data.audio) || isBase64(data.audio)) {
      // Si file existe y tiene buffer, o si es una URL o Base64, continúa
      return await (await this.getInstance(instanceName)).audioWhatsapp(data, file);
    } else {
      console.error('El archivo no tiene buffer o el audio no es una URL o Base64 válida');
      throw new BadRequestException('Owned media must be a url, base64, or valid file with buffer');
    }
  }

  public async sendButtons({ instanceName }: InstanceDto, data: SendButtonsDto) {
    return await (await this.getInstance(instanceName)).buttonMessage(data);
  }

  public async sendLocation({ instanceName }: InstanceDto, data: SendLocationDto) {
    return await (await this.getInstance(instanceName)).locationMessage(data);
  }

  public async sendList({ instanceName }: InstanceDto, data: SendListDto) {
    return await (await this.getInstance(instanceName)).listMessage(data);
  }

  public async sendContact({ instanceName }: InstanceDto, data: SendContactDto) {
    return await (await this.getInstance(instanceName)).contactMessage(data);
  }

  public async sendReaction({ instanceName }: InstanceDto, data: SendReactionDto) {
    if (!isEmoji(data.reaction)) {
      throw new BadRequestException('Reaction must be a single emoji or empty string');
    }
    return await (await this.getInstance(instanceName)).reactionMessage(data);
  }

  public async sendPoll({ instanceName }: InstanceDto, data: SendPollDto) {
    return await (await this.getInstance(instanceName)).pollMessage(data);
  }

  public async sendStatus({ instanceName }: InstanceDto, data: SendStatusDto, file?: any) {
    return await (await this.getInstance(instanceName)).statusMessage(data, file);
  }
}
