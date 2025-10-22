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
        return {
            unitid: 'MHP-009',
            unitname: 'Sydney',
            street: '123 test street',
            suburb: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            phone: '97009900',
            maintenanceschedule: 'Year 1 (2017) Qtr 4'
        }
    }
}