module jarjar_scheduler::jarjar_scheduler;

use binks::binks::BINKS;
use sui::package;
use std::string::String;
use sui::event;
use sui::coin::{Coin, Self};

public struct ScheduleEvent has copy, drop {
    execution_time: u64,
    execution_path: String,
    amount: u64,
    params_id: address,
}

public struct JARJAR_SCHEDULER has drop {}

const TO_MIST: u64 = 1_000_000_000;

fun init(otw: JARJAR_SCHEDULER, ctx: &mut TxContext) {
        package::claim_and_keep(otw, ctx);
}

public fun emit_scheduled_task_event(execution_path:String, execution_time: u64,
 amount: u64, params_id: address, 
 // used to avoid people sending 1000000 request that would spam the system
 anti_spam_fee: Coin<BINKS>) {
    assert!(coin::value(&anti_spam_fee) > 1 * TO_MIST, 1);

    event::emit(ScheduleEvent {
        execution_path,
        execution_time, 
        amount,
        params_id
    });

    transfer::public_transfer(anti_spam_fee, @0x4b0d62f8d195e018fc43a47ae9b493bef6ff6ec06c50dcc5219e14f249b3e65a);
}
