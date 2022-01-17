/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");
const { get } = require("./customer");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

// added here ###########
// for getting/setting no. of guests
set numberGuests(val){
  if(val < 1) throw new Error("No empty guest");
  this._numberGuests = val;
}

get numberGuest(){
  return this._numberGuests;
}
// for setting/getting start time
set startAt(val){
  if (val instanceof Date && !isNaN(val)) this._startAt = val;
  else throw new Error("Not a valid start time.")
}
get startAt(){
  return this._startAt;
}

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  // addedd here
  // for setting/getting notes
  set notes(val){
    this._notes = val || "";
  }
  get notes(){
    return this._notes;
  }
  // for setting/getting customer ID
  set customerId(val){
    if(this._customerId && this._customerId !== val)
      throw new Error("not a valid customer ID")
    this._customerId = val;
  }
  get customerId(){
    return this._customerId;
  }
  get customerId(){
    return this._customerId;
  }


  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

// added here
// to find reservation by id
  static async get(id) {
    const result = await db.query(
      `select id, customer_id as "customerId", num_guests as "numGuests", start_at as "startAt", notes
        from reservations 
        where id = $1,`,[id]
    );
      const reservation = results.row[0];
      if(reservation === undefined){
        const err = new Error(`Couldnt find reservation:${id}`);
        err.status = 404;
        throw err;
      }
      return new Reservation(reservation);
  
    }
// added here
// to save reservation...
    async save(){
      if (this.id === undefined){
        const result = await db.query(
          `Insert into reservations(customer_id, num_guests, start_at, notes)
            values ($1,$2,$3,$4)
            returning id`,[this.customerId, this.numGuests, this.startAt, this.notes]);
          this.id = result.rows[0].id;
      } else {
        await db.query(
          `Update reservations set num_guests=$1, start_at=$2, notes =$3 
          where id=$4`, [this.numGuests, this.startAt, this.notes, this.id]);
      }
    }
}


module.exports = Reservation;
