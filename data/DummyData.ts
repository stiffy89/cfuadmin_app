export class DummyData {

    getUserInformation() {
        return {
            'firstname': 'John',
            'lastname': 'Smith',
            'pernr': 'SMI900100',
            'position': 'CFU Team Coordinator',
            'unitid': 'MHP-100'
        }
    }

    getServices() {
        return [
            {
                'title': 'Skills Maintenance'
            },
            {
                'title': 'Resources'
            },
            {
                'title': 'Annual inventory Check'
            },
            {
                'title': 'Membership Deregistration'
            },
            {
                'title': 'CFU ID Card Request'
            },
            {
                'title': 'Equipment Repair or Replacement'
            },
            {
                'title': 'Uniform Replacement'
            },
            {
                'title': 'Map Update (PIP and Bushfire risk)'
            },
            {
                'title': 'All Services'
            }
        ]
    }

    getMyDetailData() {
        return {
            name: 'John Smith',
            membernumber: '10011234',
            preferredname: 'John',
            dob: '01/01/1954',
            gender: 'Male'
        }
    }

    getContactDetails() {
        return (
            {
                primarymobile: '0400123456',
                home: '97678900',
                work: '',
                email: '',
                home_street: '123 test st',
                home_suburb: 'sydney',
                home_postcode: '2000',
                home_state: 'NSW',
                work_street: '',
                work_suburb: '',
                work_postcode: '',
                work_state: '',
            }
        )
    }

    getEmergencyContacts() {
        return (
            [
                {
                    name: 'Jane Smith',
                    relationship: 'Spouse',
                    mobile: '0400000111',
                    street: '123 Test Street',
                    suburb: 'Sydney',
                    state: 'NSW',
                    postcode: '2000'
                }
            ]
        )
    }

    getMyUnit() {
        return [
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/Brigades('52009491')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/Brigades('52009491')",
                    "type": "Z_VOL_MEMBER_SRV.Brigade"
                },
                "Admin": false,
                "MaintSchedDesc": "",
                "Station": "Windsor",
                "StationPhone": "02 9837 5342",
                "Email": "test@test.com",
                "Pernr": "09000001",
                "Telnr": "1111 1111",
                "Short": "MHP-378",
                "Zzphone": "2222 2222",
                "Faxnr": "3333 3333",
                "Stras": "Opp 22 Dorrington Crescent",
                "Zzorgeh": "71006184",
                "Ort01": "BLIGH PARK",
                "Otext": "BLIGH PARK, Dorrington Crescent 22",
                "Pstlz": "2756",
                "Zzplans": "52009491",
                "Regio": "NSW",
                "Stext": "BLIGH PARK",
                "OpReadyCheckDate": "/Date(1488373200000)/"
            }
        ]
    }

    getTrainingHistoryData() {
        return [
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75002666')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75002666')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75002666",
                "AssessorName": "CFU Vol Test",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "SkillsReview",
                "QualificationName": "Skill Review",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1442275200000)/",
                "ValidTo": "/Date(253402214400000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003310')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003310')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003310",
                "AssessorName": "No Assessor Maintained",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S1",
                "QualificationName": "Drill 1 - Pre-Incident Plan",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1437868800000)/",
                "ValidTo": "/Date(1475107200000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003311')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003311')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003311",
                "AssessorName": "No Assessor Maintained",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S2",
                "QualificationName": "Drill 2 - Hose and Hydrant Drill",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1437523200000)/",
                "ValidTo": "/Date(1474588800000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003311')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003311')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003311",
                "AssessorName": "No Assessor Maintained",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S2",
                "QualificationName": "Drill 2 - Hose and Hydrant Drill",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1488758400000)/",
                "ValidTo": "/Date(1522281600000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003312')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003312')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003312",
                "AssessorName": "CFU Vol Test",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S3",
                "QualificationName": "Drill 3 - Portable Pumps",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1442361600000)/",
                "ValidTo": "/Date(1473897600000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003312')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003312')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003312",
                "AssessorName": "CFU Vol Test",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S3",
                "QualificationName": "Drill 3 - Portable Pumps",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1488758400000)/",
                "ValidTo": "/Date(1520208000000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003312')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003312')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003312",
                "AssessorName": "No Assessor Maintained",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S3",
                "QualificationName": "Drill 3 - Portable Pumps",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1520294400000)/",
                "ValidTo": "/Date(1520294400000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003313')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003313')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003313",
                "AssessorName": "No Assessor Maintained",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S4",
                "QualificationName": "Drill 4 - Knapsack & Small Gear",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(0000)/",
                "ValidTo": "/Date(253402214400000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003314')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003314')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003314",
                "AssessorName": "CFU Vol Test",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S5",
                "QualificationName": "Drill 5 - Safety",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1442361600000)/",
                "ValidTo": "/Date(1473897600000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003315')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003315')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003315",
                "AssessorName": "CFU Vol Test",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S6",
                "QualificationName": "Drill 6 - Scenario",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1442361600000)/",
                "ValidTo": "/Date(1473897600000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003315')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75003315')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75003315",
                "AssessorName": "No Assessor Maintained",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-S6",
                "QualificationName": "Drill 6 - Scenario",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1488326400000)/",
                "ValidTo": "/Date(1521676800000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75004262')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75004262')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75004262",
                "AssessorName": "David Forrest",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-IP1",
                "QualificationName": "Bushfire and the Influencing Factors",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1613001600000)/",
                "ValidTo": "/Date(253402214400000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75004262')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75004262')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75004262",
                "AssessorName": "David Forrest",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-IP1",
                "QualificationName": "Bushfire and the Influencing Factors",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1613001600000)/",
                "ValidTo": "/Date(253402214400000)/"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75004262')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/TrainingHistoryDetails('75004262')",
                    "type": "Z_VOL_MEMBER_SRV.TrainingHistoryDetail"
                },
                "QualificationId": "75004262",
                "AssessorName": "David Forrest",
                "Pernr": "00000000",
                "Emnam": "Mr CFU Vol Test",
                "QualificationShort": "CFU-IP1",
                "QualificationName": "Bushfire and the Influencing Factors",
                "QualificationType": "0",
                "QualificationTypeText": "Competency",
                "ValidFrom": "/Date(1613001600000)/",
                "ValidTo": "/Date(253402214400000)/"
            }
        ]
    }

    getMembershipDetailsData() {
        return [
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/MembershipDetails(Zzplans='52009491',Pernr='09000001',Objps='',Sprps='',Endda=datetime'9999-12-31T00%3A00%3A00',Begda=datetime'2015-08-03T00%3A00%3A00',Seqnr='000')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_VOL_MEMBER_SRV/MembershipDetails(Zzplans='52009491',Pernr='09000001',Objps='',Sprps='',Endda=datetime'9999-12-31T00%3A00%3A00',Begda=datetime'2015-08-03T00%3A00%3A00',Seqnr='000')",
                    "type": "Z_VOL_MEMBER_SRV.MembershipDetail"
                },
                "FromDate": "/Date(1335830400000)/",
                "FromDateLabel": "Member Since",
                "FromDateLabels": "Mem. Since",
                "LengthServiceYears": "45 Years 296 Days",
                "ZzmemtyDesc": "SECONDARYCONTACT",
                "ZzmemtyLabel": "Membership Type",
                "Zzorgeh": "71006184",
                "ZzstatuDesc": "ACTIVE",
                "ZzvstatDesc": "OPERATIONAL",
                "Otext": "MHP-378",
                "StartDate": "/Date(315532800000)/",
                "ZzstatuLabel": "Membership Status",
                "Zzplans": "52009491",
                "ZzvstatLabel": "Volunteer Status",
                "Stext": "BLIGH PARK, Dorrington Crescent 22",
                "ZzmemtyLabels": "Mem. Type",
                "Zzmtype": "04",
                "ZzstatuLabels": "Status",
                "Zzreasc": "12",
                "ZzvstatLabels": "Vol. Status",
                "Zzstatu": "3",
                "Zzvstat": "02",
                "Zzwerks": "M001",
                "Zzbtrtl": "V081",
                "Zzmemty": "95",
                "Zzkostl": "10092",
                "Zzkokrs": "NCA",
                "Zzvote": "",
                "Zzteam": "",
                "Cttyp": "",
                "Cttxt": "",
                "Zzoccupation": "Carpenter",
                "Zzvamember": "",
                "Pernr": "09000001",
                "Infty": "",
                "Subty": "",
                "Objps": "",
                "Sprps": "",
                "Endda": "/Date(253402214400000)/",
                "Begda": "/Date(1438560000000)/",
                "Seqnr": "000"
            }
        ]
    }

    getObjectsOnLoanData() {
        return [
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/ObjectsOnLoan('090000010040039999123120150721000')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/ObjectsOnLoan('090000010040039999123120150721000')",
                    "type": "Z_ESS_MSS_SRV.ObjectOnLoan"
                },
                "Admin": false,
                "CurrentOnly": false,
                "Mss": false,
                "ReturnDate": null,
                "Begda": "/Date(1437400800000)/",
                "Endda": "/Date(253402174800000)/",
                "OriginalPskeyEndda": "/Date(253402214400000)/",
                "OriginalPskeyBegda": "/Date(1437436800000)/",
                "Anzkl": "1",
                "OriginalPskeyPernr": "09000001",
                "UnitsZeinh": "020",
                "OriginalPskeyInfty": "0040",
                "OriginalPskeySubty": "03",
                "OriginalPskeyObjps": "",
                "Leihg": "03",
                "OriginalPskeySprps": "",
                "Lobnr": "1234556787",
                "OriginalPskeySeqnr": "000",
                "Text1": "Line 1",
                "ObjectKey": "090000010040039999123120150721000",
                "Text2": "Line 2",
                "ObjectTypesStext": "Books",
                "Text3": "Line 3",
                "UnitsEtext": "Pieces",
                "Zzplans": "52009491",
                "Pernr": "09000001"
            },
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/ObjectsOnLoan('090000010040289999123120200224000')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/ObjectsOnLoan('090000010040289999123120200224000')",
                    "type": "Z_ESS_MSS_SRV.ObjectOnLoan"
                },
                "Admin": false,
                "CurrentOnly": false,
                "Mss": false,
                "ReturnDate": null,
                "Begda": "/Date(1582462800000)/",
                "Endda": "/Date(253402174800000)/",
                "OriginalPskeyEndda": "/Date(253402214400000)/",
                "OriginalPskeyBegda": "/Date(1582502400000)/",
                "Anzkl": "1",
                "OriginalPskeyPernr": "09000001",
                "UnitsZeinh": "020",
                "OriginalPskeyInfty": "0040",
                "OriginalPskeySubty": "28",
                "OriginalPskeyObjps": "",
                "Leihg": "28",
                "OriginalPskeySprps": "",
                "Lobnr": "000000000000001017",
                "OriginalPskeySeqnr": "000",
                "Text1": "Y-Breeching: Non-Valved; 38 x 38 x 38mm",
                "ObjectKey": "090000010040289999123120200224000",
                "Text2": "",
                "ObjectTypesStext": "Miscellaneous",
                "Text3": "",
                "UnitsEtext": "Pieces",
                "Zzplans": "52009491",
                "Pernr": "09000001"
            }
        ]
    }

    getMedalsAndAwards() {
        return [
            {
                "__metadata": {
                    "id": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/MedalsAwards('090000019999123120150101000')",
                    "uri": "https://sapdep.nswfire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/MedalsAwards('090000019999123120150101000')",
                    "type": "Z_ESS_MSS_SRV.MedalsAward"
                },
                "OriginalPskeyPernr": "09000001",
                "Awdtx": "SES-Long Service Award 10 yrs",
                "NewRecord": false,
                "OriginalPskeyInfty": "0183",
                "BegdaChar": "",
                "OriginalPskeySubty": "",
                "ObjectKey": "090000019999123120150101000",
                "OriginalPskeyObjps": "",
                "Pernr": "09000001",
                "OriginalPskeySprps": "",
                "Subty": "",
                "OriginalPskeyEndda": "/Date(253402214400000)/",
                "Objps": "",
                "OriginalPskeyBegda": "/Date(1420070400000)/",
                "Sprps": "",
                "OriginalPskeySeqnr": "000",
                "Endda": "/Date(253402214400000)/",
                "Begda": "/Date(1420070400000)/",
                "Seqnr": "000",
                "Aedtm": "/Date(1442448000000)/",
                "Uname": "MIL901348",
                "Itxex": "X",
                "Awdtp": "S102",
                "Grpvl": "13",
                "Text1": "Awarded Late",
                "Text2": "Note Line 2",
                "Text3": "Note Line 3"
            }
        ]
    }
}
