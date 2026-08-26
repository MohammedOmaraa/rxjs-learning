import { Observable } from "rxjs";

// EventEmitter vs Observable vs Subject vs share()

// ---------- EventEmitter ----------

// import { EventEmitter } from 'node:events';
// const emitter = new EventEmitter();

// emitter.on('message', message => {
//   console.log('Listener A:', message);
// });

// emitter.on('message', message => {
//   console.log('Listener B:', message);
// });

// emitter.emit('message', 'Hello');

// output =>
// Listener A: Hello
// Listener B: Hello

// ---------- Observable ----------

const observable$ = new Observable((subscriber) => {
  console.log("Observable execution started");

  subscriber.next(Math.random());
});

observable$.subscribe((value) => {
  console.log("A:", value);
});

observable$.subscribe((value) => {
  console.log("B:", value);
});

// output =>
// Observable execution started
// A: 0.41898474529116503
// Observable execution started
// B: 0.6379687725453304

// كل واحد عنده execution مستقل.

//                  Observable
//                      │
//         ┌────────────┴────────────┐
//         │                         │
//         ▼                         ▼
//    subscribe A               subscribe B
//         │                         │
//         ▼                         ▼
//    Execution A                Execution B
//         │                         │
//         ▼                         ▼
//      random #1                 random #2

// إذن الفرق الأساسي
// EventEmitter
// ONE SOURCE
//     │
//     ├──► A
//     ├──► B
//     └──► C

// Cold Observable
// Observable definition
//     │
//     ├──► Subscription A → Execution A
//     │
//     ├──► Subscription B → Execution B
//     │
//     └──► Subscription C → Execution C

// طيب ليه بنقول Cold Observable؟
// لأن الـ Observable مش شغالة لوحدها.
// هي بتقول:
// "لما حد يشترك، أنا هبدأ."

// --------------------

// طيب هل كل Observable Cold؟
// لا.
// مش كل Observable لازم يكون Cold.
// Observable ممكن تكون:
// Cold / unicast
// Hot / multicast
// Shared

// ---------- Subject ----------

// how make observable multicast?
// using subject
import { Subject } from "rxjs";

const subject = new Subject<number>();

subject.subscribe((value) => {
  console.log("A:", value);
});

subject.subscribe((value) => {
  console.log("B:", value);
});

subject.next(100);

// output =>
// A: 100
// B: 100

//        Subject
//           │
//       next(100)
//           │
//   ┌───────┴───────┐
//   ▼               ▼
//   A               B
//  100             100

// --------------------

// Subject مختلف عن Observable العادية

// الـ Observable:
// Producer
//    │
//    ▼
// Observable
//    │
//    ▼
// Subscriber

// الـ Subject:
// Observer
//    │
//    │ next()
//    ▼
// Subject
//    │
//    ├──► Subscriber A
//    ├──► Subscriber B
//    └──► Subscriber C

// الـ Subject يقدر:
// subject.next(value);
// يعني أنت بتدفع القيمة بنفسك.

// ---------- Example ----------

// مثال واقعي جدًا في Angular

// تخيل عندك:
// User logs in
// وعايز تبلغ:

// Navbar
// Sidebar
// Profile
// Notification component

// إن المستخدم عمل login.
// ممكن يكون عندك shared stream:

//               Auth state
//                   │
//         ┌─────────┼─────────┐
//         ▼         ▼         ▼
//       Navbar    Sidebar   Profile

// كلهم محتاجين يشوفوا نفس التغيير.
// هنا الـ multicast/shared behavior مناسب.

// -======
// سؤال مهم جدًا

// لو عندي:

const subject02 = new Subject<number>();

subject02.next(100);

subject02.subscribe((value) => {
  console.log(value);
});

subject02.next(200);

// output =>
// 200

// هل subscriber سيحصل على 100؟

// لا.

// لأن الـ Subject العادي لا يحتفظ بالقيمة السابقة.

// الـ next(100) حدث قبل subscription.

// time ─────────────────────────►

// next(100)
//     │
//     │
//     ▼
// subscribe

// المشترك وصل متأخرًا.

// دي نقطة مهمة جدًا لما نوصل لـ:

// BehaviorSubject
// ReplaySubject
// shareReplay

// ---------- Subject vs EventEmitter ----------

// هنا لازم نكون دقيقين.
// الـ RxJS docs قالت:
// Subject is equivalent to an EventEmitter
// لكن مش معناها إنهم نفس الـ API أو نفس الاستخدام في كل حاجة.

// Subject:
// subject.next(value);

// EventEmitter:
// emitter.emit(value);

// الفكرة المشتركة:
// ONE SOURCE
//     │
//     ├──► A
//     ├──► B
//     └──► C

// لكن RxJS Subject يندمج مع:
// Observable
// Operators
// Subscription
// RxJS ecosystem

// ---------- share() ----------
// how make observable shared

// ممكن يكون عندك Cold Observable:

const data$ = new Observable((subscriber) => {
  console.log("API CALL");

  subscriber.next(Math.random());
});

data$.subscribe((value) => console.log("A:", value));
data$.subscribe((value) => console.log("B:", value));

// output =>
// API CALL
// A: 0.04169715903651139
// API CALL
// B: 0.35522902401670275

// so if u need same execution for all subscribtions and A,B take same values

import { share } from "rxjs";

const shared$ = new Observable((subscriber) => {
  console.log("API CALL");

  subscriber.next(Math.random());
}).pipe(share());

shared$.subscribe((value) => {
  console.log("At shared$: A:", value);
});

shared$.subscribe((value) => {
  console.log("At shared$: B:", value);
});

// في حالة وجود subscriptions متزامنة أثناء نفس shared execution، الفكرة:

//                 ONE execution
//                      │
//                 generated value
//                      │
//               ┌──────┴──────┐
//               ▼             ▼
//               A             B

// ---------- Netflix vs Cinema ----------

// تخيل عندك Netflix

// دي طريقة ممتازة لفهم الفرق.

// Cold Observable

// تخيل إن كل واحد طلب الفيلم، السيرفر بدأ نسخة تشغيل مستقلة له.

// User A → Movie execution A
// User B → Movie execution B
// Shared/Multicast

// تخيل إن فيه stream واحد:

//                 Movie stream
//                      │
//             ┌────────┼────────┐
//             ▼        ▼        ▼
//            A         B        C

// الكل يشاهد نفس الـ stream.

// ده تقريبًا مفهوم:

// Multicasting

// ---------- summary ----------

// Normal Cold Observable
//                   Observable
//                   /         \
//                  /           \
//           subscribe A     subscribe B
//                 │               │
//                 ▼               ▼
//            Execution A      Execution B
//                 │               │
//                 ▼               ▼
//               value           value
// EventEmitter / Subject Multicast
//                ONE SOURCE
//                    │
//                 event
//                    │
//           ┌────────┼────────┐
//           ▼        ▼        ▼
//           A        B        C
// Shared Observable
//                 source$
//                    │
//                  share()
//                    │
//              ONE execution
//                    │
//           ┌────────┼────────┐
//           ▼        ▼        ▼
//           A        B        C
// 28. أهم 5 كلمات هنا

// لما تقرأ RxJS docs، حاول تربط:

// Unicast
// each subscriber
// → independent execution

// Multicast
// multiple subscribers
// → same source/execution

// Cold
// subscription
// → starts execution

// Hot
// source exists independently
// of a particular subscriber

// Shared
// multiple subscribers
// → share one underlying execution
