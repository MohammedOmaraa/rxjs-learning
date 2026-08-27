import { from, Observable } from "rxjs";

// ---------- Creating Observables ----------

// Observables can be created with new Observable.
// Most commonly, observables are created using creation functions, like of, from, interval, etc.

// const observable = new Observable(function subscribe(subscriber) {
//   const id = setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);
// });

// ---------- Subscribing to Observables ----------

// A subscribe call is simply a way to start an "Observable execution"
// and deliver values or events to an Observer of that execution.

// observable.subscribe((x) => console.log(x));

// ---------- Executing Observables ----------

// There are three types of values an Observable Execution can deliver:
// "Next" notification: sends a value such as a Number, a String, an Object, etc.
// "Error" notification: sends a JavaScript Error or exception.
// "Complete" notification: does not send a value.

// "Next" notifications are the most important and most common type: they represent actual data being delivered to a subscriber.
// "Error" and "Complete" notifications may happen only once during the Observable Execution, and there can only be either one of them.

// next*(error|complete)?
// In an Observable Execution, zero to infinite Next notifications may be delivered.
// If either an Error or Complete notification is delivered, then nothing else can be delivered afterwards.

// لا يمكن Error ثم Complete
// ولا Complete ثم Next

// error و complete متنافيان
// لا يمكن الاثنين لنفس execution.

const observable2 = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // Is not delivered because it would violate the contract
});

// ---------- EventListener vs Observable subscription ----------

// button.addEventListener('click', handler);
// أنت بتضيف listener إلى event target.
// يعني الـ button ممكن يحتفظ بقائمة listeners.

// observable.subscribe(...)
// في الـ normal Observable لا يعني:
// "ضيفني لقائمة listeners."
// بل:
// "ابدأ execution جديد خاص بي."

// try/catch
// ---------- Executing Observables ----------

const observable3 = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // delivers an error if it caught one
  }
});

// مهم تفهم إن مش مطلوب منك تحط try/catch يدوي حول كل subscribe في Angular؛
// RxJS نفسها عندها mechanisms لمعالجة الأخطاء، والـ operators مثل catchError هي الطريقة المعتادة لمعالجة stream errors.

// ---------- Disposing Observable Executions ----------

const observable4 = from([10, 20, 30]);
const subscription = observable4.subscribe((x) => console.log(x));
// Later:
subscription.unsubscribe();

// --------------------

// const observable5 = new Observable(subscriber => {
//   setInterval(() => {
//     subscriber.next('hi');
//   }, 1000);
// });

// --------------------

// const observable6 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);

//   setInterval(() => {
//     console.log("test");
//   }, 2500);
// });

// const subscription2 = observable6.subscribe((value) => {
//   console.log(value);
// });

// setTimeout(() => {
//   subscription2.unsubscribe();
// }, 5000);

// output =>
// hi
// hi
// test
// hi
// hi
// hi
// test ....... infinite each 2.5(s)
//  why hi is stop and test is complete because hi come from subscriber.next() and after 5s call subscription2.unsubscribe()

// --------------------

// let id: any;

// const observable7 = new Observable((subscriber) => {
//   id = setInterval(() => {
//     subscriber.next("hi");
//     console.log("demo");
//   }, 1000);

//   setInterval(() => {
//     console.log("test");
//   }, 2500);
// });

// const subscription3 = observable7.subscribe((value) => {
//   console.log(value);
// });

// setTimeout(() => {
//   subscription3.unsubscribe();
//   clearInterval(id);
// }, 5000);

// output =>
// hi
// demo
// hi
// demo
// test
// hi
// demo
// hi
// demo
// hi
// demo
// test ....... infinite each 2.5(s)

// --------------------

// let id2: any;

// const observable8 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//     console.log("demo");
//   }, 1000);

//   id2 = setInterval(() => {
//     console.log("test");
//   }, 2500);
// });

// const subscription4 = observable8.subscribe((value) => {
//   console.log(value);
// });

// setTimeout(() => {
//   subscription4.unsubscribe();
//   clearInterval(id2);
// }, 5000);

// output =>
// hi
// demo
// hi
// demo
// test
// hi
// demo
// hi
// demo
// hi
// demo
// test
// demo ....... infinite each 2.5(s)

// --------------------

// let id: any;
// let id2: any;

// const observable9 = new Observable((subscriber) => {
//   id = setInterval(() => {
//     subscriber.next("hi");
//     console.log("demo");
//   }, 1000);

//   id2 = setInterval(() => {
//     console.log("test");
//   }, 2500);
// });

// const subscription5 = observable9.subscribe((value) => {
//   console.log(value);
// });

// setTimeout(() => {
//   subscription5.unsubscribe();
//   clearInterval(id);
//   clearInterval(id2);
// }, 5000);

// output =>
// hi
// demo
// hi
// demo
// test
// hi
// demo
// hi
// demo
// hi
// demo
// test

// --------------------

// can handle using return fun make clearInterval
const observable10 = new Observable((subscriber) => {
  const id = setInterval(() => {
    subscriber.next("hi");
    console.log("demo");
  }, 1000);

  const id2 = setInterval(() => {
    console.log("test");
  }, 2500);

  return function () {
    clearInterval(id);
    clearInterval(id2);
  };
});

const subscription6 = observable10.subscribe((value) => {
  console.log(value);
});

setTimeout(() => {
  subscription6.unsubscribe();
}, 5000);

// output =>
// hi
// demo
// hi
// demo
// test
// hi
// demo
// hi
// demo
// hi
// demo
// test
