import { interval, Subscription } from "rxjs";

// تخيل Observable = Netflix هو مصدر المحتوى.
// subscribe() = ضغط Play بدأت المشاهدة.
// Subscription = جلسة المشاهدة الحالية
// unsubscribe() = Stop / Cancel

// --------------------

// قيمة subscribe() التي ترجع لك هيSubscription
// const subscription = observable.subscribe(value => {
//   console.log(value);
// });

// Observable
//     │ subscribe()
//     ▼
// Execution يبدأ
//     │
//     ▼
// Subscription

// الـ Subscription تمثل التنفيذ الحالي للـ Observable.
// وأهم وظيفة subscription.unsubscribe();

// ---------- Combining Subscriptions ----------

// const observable1 = interval(400);
// const observable2 = interval(300);

// const subscription = observable1.subscribe((x) => console.log("first: " + x));

// const childSubscription = observable2.subscribe((x) =>
//   console.log("second: " + x),
// );

// subscription.add(childSubscription);

// setTimeout(() => {
//   subscription.unsubscribe();
// }, 1000);

// output =>
// second: 0
// first: 0
// second: 1
// first: 1
// second: 2

// لأننا عملنا subscription.add(childSubscription);
// Parent Subscription
//         └──── Child Subscription
// so when we execute subscription.unsubscribe() => unsubscribe Parent + unsubscribe Child

// لماذا add() مفيدة
// بدل
// subscription1.unsubscribe();
// subscription2.unsubscribe();
// subscription3.unsubscribe();
// subscription4.unsubscribe();

// يمكنك عمل
// const parentSubscription = new Subscription();
// parentSubscription.add(subscription1);
// parentSubscription.add(subscription2);
// parentSubscription.add(subscription3);
// parentSubscription.add(subscription4);

// then use
// parentSubscription.unsubscribe();
// كلهم يتوقفون

// --------------------

// تخيل Dashboard في مشروع Angular عندك
// User Data
// Notifications
// WebSocket
// Timer

// const parent = new Subscription();

// const userSub = this.userService.getUser()
//   .subscribe(user => {
//     console.log(user);
//   });

// const notificationSub = this.notificationService
//   .getNotifications()
//   .subscribe(data => {
//     console.log(data);
//   });

// const timerSub = interval(1000)
//   .subscribe(value => {
//     console.log(value);
//   });

// parent.add(userSub);
// parent.add(notificationSub);
// parent.add(timerSub);

// عند تدمير الـ Component
// ngOnDestroy() {
//   parent.unsubscribe();
// }
// كل شيء يتم تنظيفه

// لكن هل هذه أفضل طريقة في Angular
// في Angular  غالبًا لا نفضل إدارة كل شيء يدويًا بـ Subscription.add()

// لأن Angular يوفر طرق أفضل takeUntilDestroyed()

// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// this.service.getData()
//   .pipe(
//     takeUntilDestroyed()
//   )
//   .subscribe(data => {
//     console.log(data);
//   });

// عندما الـ Component يتم تدميره
// Component destroyed
//         ↓
// Subscription automatically unsubscribed

// --------------------

// ليس كل Observable يحتاج unsubscribe
// this.http.get('/api/products')
//   .subscribe(data => {
//     console.log(data);
//   });

// هل تحتاج unsubscribe()؟

// عادة لا
// لماذا؟
// لأن HTTP Observable
// Request
//    ↓
// Response
//    ↓
// Complete automatically
// يعني ينتهي وحده

// ---------- remove() ----------

// subscription.remove(otherSubscription);

// لو عندك parent.add(child);
// Parent
//    └── Child
// parent.remove(child);
// يصبح الـ Child لم يعد تابعًا للـ Parent
// so parent.unsubscribe() not stop Child

const parent = new Subscription();
const child = interval(1000).subscribe(console.log);
parent.add(child);

parent.remove(child);
parent.unsubscribe();

// الـ child سيستمر ولإيقافه child.unsubscribe();
setTimeout(() => {
  child.unsubscribe();
}, 2000);

// output =>
// 0
// 1

// ---------- Question ----------

// Does subscription.add() merge two Observables? No

// subscription.add(childSubscription);

// not merge Observable1 with Observable2
// ولا يخلط البيانات
// هو فقط يعمل
// Subscription lifecycle management
// يعني إدارة التنظيف

// merge() مختلف تمامًا

// مثلاً:

// merge(observable1, observable2)

// هنا أنت تدمج data streams.

// أما subscription.add() => فأنت تجمع cleanup logic.

// merge()
//     ↓
// Combine DATA

// Subscription.add()
//     ↓
// Combine CLEANUP


// مثال يوضح الفرق

// Subscription.add
// const sub1 = observable1.subscribe(...);
// const sub2 = observable2.subscribe(...);
// sub1.add(sub2);
// كل Observable له Observer مستقل.
// لكن cleanup مشترك.

// merge
// merge(observable1, observable2)
//   .subscribe(value => {
//     console.log(value);
//   });
// هنا القيم كلها تدخل لنفس الـ stream

// --------------------

// Observable	مصدر البيانات
// Observer	يستقبل البيانات
// subscribe()	يبدأ execution
// Subscription	 يمثل execution الحالي
// unsubscribe()	يلغي execution + ينظف resources
// complete()	إنهاء طبيعي من الـ Observable
// Subscription.add()	تجميع cleanup
// merge()	دمج streams
