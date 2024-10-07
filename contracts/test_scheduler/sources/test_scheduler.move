#[allow(lint(self_transfer))]
module test_scheduler::test_scheduler;

use jarjar_scheduler::jarjar_scheduler::{Self};
use std::string::{String,};
use sui::coin::{Coin, Self};
use sui::balance::{Self, Balance};
use sui::package;
use sui::clock::{Clock};
use binks::binks::{BINKS};

const EExecutionTimeTooEarly: u64 = 1;


public struct Params has key {
    id: UID,
    text: String,
    sender: address,
    fee: Balance<BINKS>,
    execution_time: u64,
}

public struct TEST_SCHEDULER has drop {}

fun init(witness: TEST_SCHEDULER, ctx: &mut TxContext) {
    let publisher = package::claim(witness, ctx);
   
    package::burn_publisher(publisher);
}


public fun register_scheduled_task(execution_path: String, execution_time: u64, fee: Coin<BINKS>,
 anti_spam_fee: Coin<BINKS>,ctx: &mut TxContext) {

    let amount = coin::value(&fee);

    let params = Params {
        id: object::new(ctx),
        text: (b"String").to_string(),
        sender: ctx.sender(),
        fee: coin::into_balance(fee), // MANDATORY if you want the scheduler to execute
        execution_time, // MANDATORY if you want the scheduler to execute
    };

    let params_address: address = object::uid_to_address(&params.id);

    jarjar_scheduler::emit_scheduled_task_event(execution_path, execution_time, amount, params_address, anti_spam_fee);
    transfer::share_object(params);
}

public fun task_to_execute(params: Params, clock: &Clock, ctx: &mut TxContext) {
    let current_time = clock.timestamp_ms();
    assert!(params.execution_time < current_time, EExecutionTimeTooEarly);

    let Params {id, fee, text, execution_time, sender} = params;
    std::debug::print(&text);
    std::debug::print(&execution_time);
    std::debug::print(&sender);
    object::delete(id);

    let coin = coin::from_balance(fee, ctx);

    transfer::public_transfer(coin, ctx.sender())
}

public fun cancel_task(params: Params, ctx: &mut TxContext) {
    assert!(params.sender == ctx.sender());
    let Params {id, fee, text:_,execution_time:_, sender:_} = params;
    let coin = coin::from_balance(fee, ctx);
    object::delete(id);

    
    transfer::public_transfer(coin, ctx.sender())
}

