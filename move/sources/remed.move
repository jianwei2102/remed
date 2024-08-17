module remed_addr::remed {
    use aptos_framework::account;
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use std::string::{String};

    // Structs
    struct AuthList has key {
        authorized: vector<Authorization>,
        set_auth_event: event::EventHandle<Authorization>,
    }

    struct Authorization has store, drop, copy {
        address: address,
        date: String,
    }

    struct EMRList has key {
        records: vector<EMR>,
    }

    struct EMR has store, drop, copy {
        record_hash: String,
        record_details: String,
        record_type: String,
        added_by: address,
    }
    
    // Initializer
    public entry fun creating_auth_list(account: &signer) {
        let auth_list = AuthList{
            authorized: vector::empty<Authorization>(),
            set_auth_event: account::new_event_handle<Authorization>(account),
        };
        move_to(account, auth_list);
    }

    public entry fun patient_initialize(account: &signer) {
        creating_auth_list(account);

        // Initialize EMR list
        let emr_list = EMRList{
            records: vector::empty<EMR>(),
        };
        move_to(account, emr_list);
    }

    // Access Control
    public entry fun authorize_doctor(account: &signer, doctor_address: address, date: String) acquires AuthList {
        // Get patient's list
        let signer_address = signer::address_of(account);
        let patient_auth_list = borrow_global_mut<AuthList>(signer_address);

        // create new authorization and push
        let new_pat_auth = Authorization{
            address: doctor_address,
            date: date,
        };
        vector::push_back(&mut patient_auth_list.authorized, new_pat_auth);

        // Commit an patient event
        event::emit_event<Authorization>(
            &mut patient_auth_list.set_auth_event,
            new_pat_auth
        );

        // Get doctor's list
        let doctor_auth_list = borrow_global_mut<AuthList>(doctor_address);

        // create new authorization and push
        let new_doc_auth = Authorization{
            address: signer_address,
            date: date
        };
        vector::push_back(&mut doctor_auth_list.authorized, new_doc_auth);

        // Commit an doctor event
        event::emit_event<Authorization>(
            &mut doctor_auth_list.set_auth_event,
            new_doc_auth
        );
    }

    public entry fun revoke_auth(account: &signer, doctor_address: address) acquires AuthList {
        // Get patient's list
        let signer_address = signer::address_of(account);
        let patient_auth_list = borrow_global_mut<AuthList>(signer_address);

        // Remove authorization from patient's list
        let i = 0;
        while (i < vector::length(&patient_auth_list.authorized)) {
            let auth = vector::borrow(&patient_auth_list.authorized, i);
            if (auth.address == doctor_address) {
                vector::remove(&mut patient_auth_list.authorized, i);
                break
            };
            i = i + 1;
        };

        // Get doctor's list
        let doctor_auth_list = borrow_global_mut<AuthList>(doctor_address);

        // Remove authorization from doctor's list
        let j = 0;
        while (j < vector::length(&doctor_auth_list.authorized)) {
            let auth = vector::borrow(&doctor_auth_list.authorized, j);
            if (auth.address == signer_address) {
                vector::remove(&mut doctor_auth_list.authorized, j);
                break
            };
            j = j + 1;
        };
    }

    // EMR Functions
    public entry fun append_record(account: &signer, patient_address: address, record_hash: String, record_details: String, record_type: String) acquires EMRList {
        // Get patient's list
        let signer_address = signer::address_of(account);
        let patient_EMR_list = borrow_global_mut<EMRList>(patient_address);

        let new_emr = EMR {
            record_hash,
            record_details,
            record_type,
            added_by: signer_address,
        };
        vector::push_back(&mut patient_EMR_list.records, new_emr);
    }


    // Errors
    const EUNAUTHORIZED: u64 = 1;
    const EAUTHORIZATION_EXIST: u64 = 2;
    const EAUTHORIZATION_NOT_EXIST: u64 = 3;
    const ERECORD_NOT_FOUND: u64 = 4;
    const EINVALID_RECORD_PERMISSION: u64 = 5;
    const ERECORD_HASH_EXISTS: u64 = 6;
}
