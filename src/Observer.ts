// An Observer is a consumer of values delivered by an Observable.

import { Observable } from "rxjs";

// الـ Observable هو الذي ينتج/يرسل values.
// والـ Observer هو الذي يستقبل هذه values.
// Observable = Producer
// Observer = Consumer

// الـ Observer في RxJS هو object يحتوي callbacks.
// const observer = {
//   next: x => console.log('next:', x),
//   error: err => console.error('error:', err),
//   complete: () => console.log('complete'),
// };

// عندك 3 أنواع notifications أساسية:
// next
// error
// complete

// --------------------

// const observable = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);
// });

// const observer = {
//   complete: () => console.log("Observer got a complete notification"),
// };

// const subscription = observable.subscribe(observer);

// setInterval(() => {
//   subscription.unsubscribe();
// }, 5000);

// output =>
// No output

// why complete not work after 5s?
// unsubscribe() لا يعني complete()
// لذلك الـ "hi" يتم إنتاجه، لكن لا يوجد next handler يستقبله.

// complete()
//     ↓
// Observable says:
// "I'm finished."

// unsubscribe()
//     ↓
// Subscriber says:
// "I don't want to listen anymore."

// العملية      	من يقوم بها؟                     	معناها
// subscriber.next(value)	       Observable	     عندي value جديدة
// subscriber.error(err)	       Observable	    حصل failure وانتهيت
// subscriber.complete()	       Observable	         خلصت بنجاح
// subscription.unsubscribe()	    Consumer	    أوقف الاشتراك/التنفيذ

// --------------------

// const observable2 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);

//   setInterval(() => {
//     subscriber.complete();
//   }, 5000);
// });

// const observer2 = {
//   complete: () => console.log("Observer got a complete notification"),
// };

// const subscription2 = observable2.subscribe(observer2);

// setInterval(() => {
//   subscription2.unsubscribe();
// }, 5000);

// output =>
// Observer got a complete notification

// --------------------

// const observable3 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);

//   setInterval(() => {
//     subscriber.complete();
//   }, 2500);
// });

// const observer3 = {
//   complete: () => console.log("Observer got a complete notification"),
// };

// const subscription3 = observable3.subscribe(observer3);

// setInterval(() => {
//   subscription3.unsubscribe();
// }, 5000);

// output =>
// Observer got a complete notification

// --------------------

// const observable4 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 2500);

//   setInterval(() => {
//     subscriber.complete();
//   }, 5000);
// });

// const observer4 = {
//   next: () => console.log("Observer got a next notification"),
//   complete: () => console.log("Observer got a complete notification"),
// };

// const subscription4 = observable4.subscribe(observer4);

// setInterval(() => {
//   subscription4.unsubscribe();
// }, 5000);

// output =>
// Observer got a next notification
// Observer got a next notification
// Observer got a complete notification

// --------------------

// const observable5 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);

//   setInterval(() => {
//     subscriber.complete();
//   }, 2500);
// });

// const observer5 = {
//   next: () => console.log("Observer got a next notification"),
//   complete: () => console.log("Observer got a complete notification"),
// };

// const subscription5 = observable5.subscribe(observer5);

// setInterval(() => {
//   subscription5.unsubscribe();
// }, 5000);

// output =>
// Observer got a next notification
// Observer got a next notification
// Observer got a complete notification

// --------------------

// const observable6 = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next("hi");
//   }, 1000);

//   setInterval(() => {
//     subscriber.complete();
//   }, 2500);
// });

// const observer6 = {
//   next: () => console.log("Observer got a next notification"),
//   complete: () => console.log("Observer got a complete notification"),
// };

// const subscription6 = observable6.subscribe(observer6);

// setInterval(() => {
//   subscription6.unsubscribe();
// }, 2500);

// output =>
// Observer got a next notification
// Observer got a next notification
// Observer got a complete notification

// why complete execute and unsubscribe not and they take same time

// JavaScript ينفذ JavaScript code على الـ main thread واحدًا في كل مرة.
// حتى لو:
// Timer A → 2500ms
// Timer B → 2500ms
// سيحدث:
// Timer A callback
//         finishes
//              ↓
// Timer B callback

// 0ms
// │
// ├── Timer A registered (1000)
// ├── Timer B registered (2500 complete)
// └── Timer C registered (2500 unsubscribe)

// 1000ms
// │
// └── Timer A
//      subscriber.next("hi")
//             ↓
//      observer.next()
//             ↓
//      "next notification"

// 2000ms
// │
// └── Timer A
//      subscriber.next("hi")
//             ↓
//      "next notification"

// 2500ms
// │
// ├── Timer B first
// │      │
// │      └── subscriber.complete()
// │                ↓
// │           observer.complete()
// │                ↓
// │           "complete notification"
// │
// └── Timer C second
//        │
//        └── subscription.unsubscribe()
//               │
//               ▼
//          already closed

// --------------------

// لكن هنا عندك نقطة مهمة جدًا:
// الـ first setInterval نفسه ما زال يعمل!
// الأفضل كتابة الكود هكذا
const observable7 = new Observable<string>((subscriber) => {
  const nextIntervalId = setInterval(() => {
    subscriber.next("hi");
  }, 1000);

  const completeTimeoutId = setTimeout(() => {
    subscriber.complete();
  }, 2500);

  return () => {
    clearInterval(nextIntervalId);
    clearTimeout(completeTimeoutId);

    console.log("Cleanup executed");
  };
});

const observer7 = {
  next: () => console.log("Observer got a next notification"),
  complete: () => console.log("Observer got a complete notification"),
};

const subscription7 = observable7.subscribe(observer7);

setInterval(() => {
  subscription7.unsubscribe();
}, 2500);

// Observer got a next notification
// Observer got a next notification
// Observer got a complete notification
// Cleanup executed


// Teardown / Cleanup execute after Execution Ends

//                 Observable Execution

//                        │
//         ┌──────────────┼──────────────┐
//         │              │              │
//         ▼              ▼              ▼

//    unsubscribe()    complete()      error()
//         │              │              │
//         └──────────────┼──────────────┘
//                        │
//                        ▼
//                 Execution Ends
//                        │
//                        ▼
//               Teardown / Cleanup
