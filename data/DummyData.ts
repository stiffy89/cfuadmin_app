export class DummyData {
    
    getUserInformation () {
        return {
            'firstname' : 'John',
            'lastname' : 'Smith',
            'pernr' : 'SMI900100',
            'position': 'CFU Team Coordinator',
            'unitid': 'MHP-100'
        }
    }

    getServices () {
        return [
            {
                'title' : 'Skills Maintenance'
            },
            {
                'title' : 'Resources'
            },
            {
                'title' : 'Annual inventory Check'
            },
            {
                'title' : 'Membership Deregistration'
            },
            {
                'title' : 'CFU ID Card Request'
            },
            {
                'title' : 'Equipment Repair or Replacement'
            },
            {
                'title' : 'Uniform Replacement'
            },
            {
                'title' : 'Map Update (PIP and Bushfire risk)'
            },
            {
                'title' : 'All Services'
            }
        ]
    }
}