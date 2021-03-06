const customersRepo = require('../../../lib/customersRepository'),
      statesRepo = require('../../../lib/statesRepository'),
      util = require('util'); //NodeJs Util pro logging

class CustomersController {

    constructor(router) {
        //bind musime pouzit aby jsme mohli pristupovat k metoda
        //pokud by jsme se nebindovali na this, tak by to znamenalo, ze getCustomers se bude tvarit jako GlobalObject, ktery je unknown
        //Proto mu musime predat context
        //mohlo by take byt myJsModul.getCustomers.bind(myJsModul)
        //proste nastavujeme proper this - v kurzu pise ze je to optional, ale radsi to nastavuje aby se predeslo problemum
        router.get('/', this.getCustomers.bind(this));
        router.get('/page/:skip/:top', this.getCustomersPage.bind(this));
        router.get('/:id', this.getCustomer.bind(this));
        router.post('/', this.insertCustomer.bind(this));
        router.put('/:id', this.updateCustomer.bind(this));
        router.delete('/:id', this.deleteCustomer.bind(this));
    }

    getCustomers(req, res) {
        console.log('*** getCustomers');
        //nechceme aby routing controller vedel neco o DB
        customersRepo.getCustomers((err, data) => {
            if (err) {
                console.log('*** getCustomers error: ' + util.inspect(err));
                res.json(null); //muzeme vratit nejakou error message, ale lepsi je logovat na serveru a na clientovi jen rict, ze doslo k chybe
                //res.json({ error: err }); tot je dalsi moznost
            } else {
                console.log('*** getCustomers ok');
                res.json(data.customers);
            }
        });
    }

    getCustomersPage(req, res) {
        console.log('*** getCustomersPage');
        const topVal = req.params.top,
              skipVal = req.params.skip,
              top = (isNaN(topVal)) ? 10 : +topVal,
              skip = (isNaN(skipVal)) ? 0 : +skipVal;

        customersRepo.getPagedCustomers(skip, top, (err, data) => {
            //pro toto je lepsi pouzit header
            res.setHeader('X-InlineCount', data.count);
            if (err) {
                console.log('*** getCustomersPage error: ' + util.inspect(err));
                res.json(null);
            } else {
                console.log('*** getCustomersPage ok');
                res.json(data.customers);
            }
        });
    }

    getCustomer(req, res) {
        console.log('*** getCustomer');
        const id = req.params.id;
        console.log(id);

        customersRepo.getCustomer(id, (err, customer) => {
            if (err) {
                console.log('*** getCustomer error: ' + util.inspect(err));
                res.json(null);
            } else {
                console.log('*** getCustomer ok');
                res.json(customer);
            }
        });
    }

    insertCustomer(req, res) {
        console.log('*** insertCustomer');
        //nejdriev musime ziskat stateId - jedna se jen o overeni, ze dany stateId opravdu existuje
        //Mongoose funguje na principu callbacku
        statesRepo.getState(req.body.stateId, (err, state) => {
            if (err) {
                //pokud neni state tak vyhodime error
                console.log('*** statesRepo.getState error: ' + util.inspect(err));
                res.json({ status: false, error: 'State not found', customer: null });
            } else {
                //pokud state je, tak prejdeme k ulozeni customera
                customersRepo.insertCustomer(req.body, state, (err, customer) => {
                    if (err) {
                        console.log('*** customersRepo.insertCustomer error: ' + util.inspect(err));
                        res.json({status: false, error: 'Insert failed', customer: null});
                    } else {
                        console.log('*** insertCustomer ok');
                        res.json({ status: true, error: null, customer: customer });
                    }
                });
            }
        });
    }

    updateCustomer(req, res) {
        console.log('*** updateCustomer');
        console.log('*** req.body');
        console.log(req.body);

        if (!req.body || !req.body.stateId) {
            throw new Error('Customer and associated stateId required');
        }

        statesRepo.getState(req.body.stateId, (err, state) => {
            if (err) {
                console.log('*** statesRepo.getState error: ' + util.inspect(err));
                res.json({ status: false, error: 'State not found', customer: null });
            } else {
                customersRepo.updateCustomer(req.params.id, req.body, state, (err, customer) => {
                    if (err) {
                        console.log('*** updateCustomer error: ' + util.inspect(err));
                        res.json({ status: false, error: 'Update failed', customer: null });
                    } else {
                        console.log('*** updateCustomer ok');
                        res.json({ status: true, error: null, customer: customer });
                    }
                });
            }
        });
    }

    deleteCustomer(req, res) {
        console.log('*** deleteCustomer');

        customersRepo.deleteCustomer(req.params.id, (err) => {
            if (err) {
                console.log('*** deleteCustomer error: ' + util.inspect(err));
                res.json({ status: false });
            } else {
                console.log('*** deleteCustomer ok');
                res.json({ status: true });
            }
        });
    }

}

module.exports = CustomersController;