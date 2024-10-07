// #[test_only]
// module test_scheduler::test_scheduler_tests {
//     use test_scheduler::test_scheduler;
//     use sui::test_scenario::{Self};
//     use sui::clock::{Self};
//     use sui::coin::{Self};
//     use std::string;
//     use binks::binks::{BINKS};

//     #[test]
//     fun test_register_and_execute_task() {
//         let owner = @0xA;
//         let mut scenario_val = test_scenario::begin(owner);
//         let scenario = &mut scenario_val;

//         // Create a Clock object
//         let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));

//         // Set up the test
//         test_scenario::next_tx(scenario, owner);
//         {
//             // Create ContractInfos object
//             let contract_infos = test_scheduler::create_dummy_contract_infos(test_scenario::ctx(scenario));
//             // Create a dummy Coin<SUI> for the fee
//             let fee = coin::mint_for_testing<BINKS>(100, test_scenario::ctx(scenario));
//             let anti_spam_fee = coin::mint_for_testing<BINKS>(2, test_scenario::ctx(scenario));

//             // Register the scheduled task
//             test_scheduler::register_scheduled_task(
//                 string::utf8(b"execution_path"),
//                 17277709980000, // Set execution time in the future
//                 fee,
//                 anti_spam_fee,
//                 test_scenario::ctx(scenario)
//             );
//             // Set clock to a time before execution_time
//             test_scheduler::delete_dummy_contract_infos(contract_infos);
//             clock::set_for_testing(&mut clock, 500);
//         };
//         // Clean up
//         clock::destroy_for_testing(clock);
//         test_scenario::end(scenario_val);
//     }

//     #[test]
//     #[expected_failure]
//     fun test_anti_spam_fee_too_low() {
//         let owner = @0xA;
//         let mut scenario_val = test_scenario::begin(owner);
//         let scenario = &mut scenario_val;

//         // Create a Clock object
//         let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));

//         // Set up the test
//         test_scenario::next_tx(scenario, owner);
//         {
//             // Create ContractInfos object
//             let contract_infos = test_scheduler::create_dummy_contract_infos(test_scenario::ctx(scenario));
//             // Create a dummy Coin<SUI> for the fee
//             let fee = coin::mint_for_testing<BINKS>(100, test_scenario::ctx(scenario));
//             let anti_spam_fee = coin::mint_for_testing<BINKS>(0, test_scenario::ctx(scenario));

//             // Register the scheduled task
//             test_scheduler::register_scheduled_task(
//                 string::utf8(b"execution_path"),
//                 17277709980000, // Set execution time in the future
//                 fee,
//                 &contract_infos,
//                 anti_spam_fee,
//                 test_scenario::ctx(scenario)
//             );
//             // Set clock to a time before execution_time
//             test_scheduler::delete_dummy_contract_infos(contract_infos);
//             clock::set_for_testing(&mut clock, 500);
//         };
//         // Clean up
//         clock::destroy_for_testing(clock);
//         test_scenario::end(scenario_val);
//     }

//     #[test]
//     #[expected_failure]
//     fun test_task_to_execute_too_early() {
//         let owner = @0xA;
//         let mut scenario_val = test_scenario::begin(owner);
//         let scenario = &mut scenario_val;

//         let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));

//         // ... (similar setup as above)

//         // Set clock to a time after execution_time
//         clock::set_for_testing(&mut clock, 1500);
//         let execution_time = 1499;

//         let fee = coin::mint_for_testing<BINKS>(100, test_scenario::ctx(scenario));
//         // This should fail because the execution time has passed
//         let params = test_scheduler::create_dummy_params(execution_time, fee, test_scenario::ctx(scenario));
//         test_scheduler::task_to_execute(params, &clock, test_scenario::ctx(scenario));

//         clock::destroy_for_testing(clock);
//         test_scenario::end(scenario_val);
//     }
// }

