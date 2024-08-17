// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

contract Remed {
    struct Authorization {
        address addr;
        uint256 date;
    }

    struct EMR {
        string recordHash;
        string recordDetails;
        string recordType;
        address addedBy;
    }

    struct AuthList {
        Authorization[] authorized;
    }

    struct EMRList {
        EMR[] records;
    }

    mapping(address => AuthList) private patientAuthLists;
    mapping(address => AuthList) private doctorAuthLists;
    mapping(address => EMRList) private emrLists;

    enum ErrorCode {
        Unauthorized,
        AuthorizationExist,
        AuthorizationNotExist,
        RecordNotFound,
        InvalidRecordPermission,
        RecordHashExists
    }

    event Error(ErrorCode code);
    event Debug(string message);
    event DebugAddress(address addr);
    event DebugUint(uint256 uinteger);

    function authorizeDoctor(address doctorAddress) public {
        AuthList storage patientAuthList = patientAuthLists[msg.sender];
        AuthList storage doctorAuthList = doctorAuthLists[doctorAddress];

        // Check if the doctor's address already exists in the authorized list
        for (uint i = 0; i < patientAuthList.authorized.length; i++) {
            if (patientAuthList.authorized[i].addr == doctorAddress) {
                emit Error(ErrorCode.AuthorizationExist);
                revert("Authorization exists.");
            }
        }

        Authorization memory newDoctorAuth = Authorization({addr: msg.sender, date: block.timestamp});

        doctorAuthList.authorized.push(newDoctorAuth);

        Authorization memory newPatientAuth = Authorization({addr: doctorAddress, date: block.timestamp});

        patientAuthList.authorized.push(newPatientAuth);
    }

    function revokeDoctor(address doctorAddress) public {
        AuthList storage patientAuthList = patientAuthLists[msg.sender];
        AuthList storage doctorAuthList = doctorAuthLists[doctorAddress];

        // Verify that the doctor's address is present in the authorized list
        bool exists = false;
        for (uint i = 0; i < patientAuthList.authorized.length; i++) {
            emit Debug("checking auth list");
            if (patientAuthList.authorized[i].addr == doctorAddress) {
                emit Debug("Doctor found");
                exists = true;
                break;
            }
        }

        if (!exists) {
            emit Error(ErrorCode.AuthorizationNotExist);
            revert("Authorization not exist.");
        }

        removeAuthorization(patientAuthList.authorized, doctorAddress);
        removeAuthorization(doctorAuthList.authorized, msg.sender);
    }

    function revokePatient(address patientAddress) public {
        AuthList storage patientAuthList = patientAuthLists[patientAddress];
        AuthList storage doctorAuthList = doctorAuthLists[msg.sender];

        // Verify that the doctor's address is present in the authorized list
        bool exists = false;
        for (uint i = 0; i < patientAuthList.authorized.length; i++) {
            if (patientAuthList.authorized[i].addr == msg.sender) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            emit Error(ErrorCode.AuthorizationNotExist);
            revert("Authorization not exist.");
        }

        removeAuthorization(patientAuthList.authorized, msg.sender);
        removeAuthorization(doctorAuthList.authorized, patientAddress);
    }

    function appendRecord(
        address patient,
        string memory recordHash,
        string memory recordDetails,
        string memory recordType
    ) public {
        AuthList storage patientAuthList = patientAuthLists[patient];
        bool authorized = false;

        for (uint i = 0; i < patientAuthList.authorized.length; i++) {
            if (patientAuthList.authorized[i].addr == msg.sender) {
                authorized = true;
                break;
            }
        }

        if (!authorized) {
            emit Error(ErrorCode.AuthorizationNotExist);
            revert("Authorization not exist.");
        }

        EMRList storage emrList = emrLists[patient];
        for (uint i = 0; i < emrList.records.length; i++) {
            if (keccak256(abi.encodePacked(emrList.records[i].recordHash)) == keccak256(abi.encodePacked(recordHash))) {
                emit Error(ErrorCode.RecordHashExists);
                revert("Record hash exists.");
            }
        }

        EMR memory newEmr = EMR({
            recordHash: recordHash,
            recordDetails: recordDetails,
            recordType: recordType,
            addedBy: msg.sender
        });

        emrList.records.push(newEmr);
    }

    function modifyRecord(
        address patient,
        string memory currentRecordHash,
        string memory newRecordHash,
        string memory recordDetails
    ) public {
        AuthList storage patientAuthList = patientAuthLists[patient];
        bool authorized = false;
        for (uint i = 0; i < patientAuthList.authorized.length; i++) {
            if (patientAuthList.authorized[i].addr == msg.sender) {
                authorized = true;
                break;
            }
        }

        if (!authorized) {
            emit Error(ErrorCode.Unauthorized);
            revert("Unauthorized.");
        }

        EMRList storage emrList = emrLists[patient];
        bool recordFound = false;

        for (uint i = 0; i < emrList.records.length; i++) {
            if (
                keccak256(abi.encodePacked(emrList.records[i].recordHash)) ==
                keccak256(abi.encodePacked(currentRecordHash))
            ) {
                if (emrList.records[i].addedBy == msg.sender) {
                    emrList.records[i].recordHash = newRecordHash;
                    emrList.records[i].recordDetails = recordDetails;
                    recordFound = true;
                    break;
                } else {
                    emit Error(ErrorCode.InvalidRecordPermission);
                    revert("Invalid record permission.");
                }
            }
        }

        if (!recordFound) {
            emit Error(ErrorCode.RecordNotFound);
            revert("Record not found.");
        }
    }

    function closePatientAuthList() public {
        delete patientAuthLists[msg.sender];
    }

    function closeEMRList() public {
        delete emrLists[msg.sender];
    }

    function removeAuthorization(Authorization[] storage list, address addr) internal {
        for (uint i = 0; i < list.length; i++) {
            if (list[i].addr == addr) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2 ** (8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    // Getter functions for the mappings
    function getPatientAuthList(address patient) public view returns (Authorization[] memory) {
        return patientAuthLists[patient].authorized;
    }

    function getDoctorAuthList(address doctor) public view returns (Authorization[] memory) {
        return doctorAuthLists[doctor].authorized;
    }

    function getEmrList(address patient) public view returns (EMR[] memory) {
        return emrLists[patient].records;
    }
}
