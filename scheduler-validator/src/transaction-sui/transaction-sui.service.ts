import { Injectable } from '@nestjs/common';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

import {
  SerialTransactionExecutor,
  Transaction,
} from '@mysten/sui/transactions';
import { mnemonicToSeedHex } from '@mysten/sui/cryptography';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class TransactionSuiService {
  suiClient: SuiClient;
  keyPair: Ed25519Keypair;
  executor: SerialTransactionExecutor; // SuiTransactionExecutor;
  provider;

  constructor() {
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(process.env.SUI_NETWORK as 'mainnet' | 'testnet'),
    });

    const seed = mnemonicToSeedHex(process.env.MNEMONIC);
    this.keyPair = Ed25519Keypair.deriveKeypairFromSeed(seed);

    this.logInfo();
    this.executor = new SerialTransactionExecutor({
      client: this.suiClient,
      signer: this.keyPair,
    });
  }

  async runDryRun(tx: Uint8Array) {
    const result = await this.suiClient.dryRunTransactionBlock({
      transactionBlock: tx,
    });
    return result;
  }

  async sendCallbackTx(event: Event) {
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${event.packageId}::${event.execution_path}`,
        arguments: [tx.object(event.params_id), tx.object(SUI_CLOCK_OBJECT_ID)],
      });

      const digest = await this.sendTransaction(tx);
      return digest;
    } catch (e) {
      throw e;
    }
  }

  async sendTransaction(tx) {
    const [{ digest: digest }] = await Promise.all([
      this.executor.executeTransaction(tx),
    ]);

    return digest;
  }

  logInfo() {
    console.log(
      'Scheduler running on address:',
      this.keyPair.getPublicKey().toSuiAddress(),
    );
    console.log(
      'Querying events from               ',
      process.env.EVENT_PACKAGE_ID,
      ' module ',
      process.env.EVENT_MODULE_NAME,
    );
    console.log('Sui network:                       ', process.env.SUI_NETWORK);
  }
}
