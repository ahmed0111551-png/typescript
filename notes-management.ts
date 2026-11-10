// =====================================================
// Assignment 14 - TypeScript OOP
// Part A - Simple Notes Management System
// =====================================================

// -----------------------------------------------------
// 7. Generics - Data Storage
// -----------------------------------------------------
// export {} بتخلي الملف module عشان اسم Storage ميتعارضش مع Storage بتاع المتصفح
export {};

class Storage<T> {
  private items: T[] = [];

  addItem(item: T): void {
    this.items.push(item);
  }

  removeItem(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  getAllItems(): T[] {
    return [...this.items]; // نسخة عشان محدش يعدل المصفوفة الأصلية
  }
}

// -----------------------------------------------------
// 1. Base Class - User
// -----------------------------------------------------
class User {
  public readonly id: number; // public: متاح من بره، readonly: مينفعش يتغير
  public name: string;
  public email: string;
  private password: string; // private: داخل الكلاس بس
  protected phone: string; // protected: الكلاس + الكلاسات اللي بترث منه
  private _age: number;

  // Aggregation: اليوزر "بيملك" نوتبوكس، لكن النوتبوك موجود مستقل عنه
  protected notebooks: NoteBook[] = [];

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this._age = User.validateAge(age);
  }

  // التحقق من السن (بين 18 و 60)
  private static validateAge(age: number): number {
    if (age < 18 || age > 60) {
      throw new Error("Age must be between 18 and 60");
    }
    return age;
  }

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    this._age = User.validateAge(value);
  }

  checkPassword(input: string): boolean {
    return this.password === input;
  }

  displayInfo(): void {
    console.log("---------- User Info ----------");
    console.log(`Id: ${this.id}`);
    console.log(`Name: ${this.name}`);
    console.log(`Email: ${this.email}`);
    console.log(`Phone: ${this.phone}`);
    console.log(`Age: ${this._age}`);
  }

  // ---- 5. Aggregation: User <>--- NoteBook ----
  addNotebook(notebook: NoteBook): void {
    if (!this.notebooks.includes(notebook)) {
      this.notebooks.push(notebook);
    }
  }

  removeNotebook(notebook: NoteBook): boolean {
    const index = this.notebooks.indexOf(notebook);
    if (index === -1) return false;
    this.notebooks.splice(index, 1); // النوتبوك نفسه لسه موجود (ده معنى Aggregation)
    return true;
  }

  getNotebooks(): NoteBook[] {
    return [...this.notebooks];
  }
}

// -----------------------------------------------------
// 2. Inheritance - Admin extends User
// -----------------------------------------------------
class Admin extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    super(id, name, email, password, phone, age);
  }

  // Override لـ displayInfo
  override displayInfo(): void {
    super.displayInfo();
    console.log("Role: Admin");
  }

  // الأدمن يقدر يدير النوتس (يعرضها أو يمسح منها)
  manageNotes(
    notebook: NoteBook,
    action: "list" | "delete",
    noteId?: number
  ): void {
    if (action === "list") {
      console.log(`Admin ${this.name} is viewing notes of "${notebook.name}":`);
      notebook.getNotes().forEach((n) => console.log(` - [${n.id}] ${n.title}: ${n.preview()}`));
    } else if (action === "delete") {
      if (noteId === undefined) {
        console.log("Please provide a note id to delete.");
        return;
      }
      const removed = notebook.removeNote(noteId);
      console.log(
        removed
          ? `Admin ${this.name} deleted note #${noteId}`
          : `Note #${noteId} not found`
      );
    }
  }
}

// -----------------------------------------------------
// 3. Class - Note
//    6. Association: Note ---> User (كل نوت لها author)
// -----------------------------------------------------
class Note {
  constructor(
    public readonly id: number,
    public title: string,
    public content: string,
    public readonly author: User // Association
  ) {}

  // userId = reference to User
  get userId(): number {
    return this.author.id;
  }

  // يرجع معاينة قصيرة من المحتوى
  preview(length: number = 30): string {
    return this.content.length > length
      ? this.content.substring(0, length) + "..."
      : this.content;
  }
}

// -----------------------------------------------------
// 4. Composition - NoteBook contains Notes
// -----------------------------------------------------
class NoteBook {
  // النوتس بتتعمل جوه النوتبوك ومتتحكمش فيها من بره = Composition
  private notes: Note[] = [];
  private nextNoteId: number = 1;

  constructor(public readonly id: number, public name: string) {}

  // النوت بتتخلق جوه النوتبوك نفسه (النوتبوك هو المسؤول عن دورة حياتها)
  addNote(title: string, content: string, author: User): Note {
    const note = new Note(this.nextNoteId++, title, content, author);
    this.notes.push(note);
    return note;
  }

  removeNote(noteId: number): boolean {
    const index = this.notes.findIndex((n) => n.id === noteId);
    if (index === -1) return false;
    this.notes.splice(index, 1);
    return true;
  }

  getNotes(): Note[] {
    return [...this.notes];
  }
}

// =====================================================
// Demo / تجربة الكود
// =====================================================
const user1 = new User(1, "Ahmed", "ahmed@example.com", "123456", "01040544207", 22);
const admin = new Admin(2, "Admin", "admin@example.com", "admin123", "01000000000", 35);

user1.displayInfo();
admin.displayInfo();

// Validation للسن
try {
  new User(3, "Kid", "kid@example.com", "pass", "01111111111", 15);
} catch (e) {
  console.log("Error:", (e as Error).message);
}

// Aggregation: اليوزر يملك أكتر من نوتبوك
const work = new NoteBook(1, "Work");
const study = new NoteBook(2, "Study");
user1.addNotebook(work);
user1.addNotebook(study);
console.log(`${user1.name} owns ${user1.getNotebooks().length} notebooks`);

// Composition + Association
work.addNote("Meeting", "Discuss the project timeline with the team on Sunday", user1);
work.addNote("Todo", "Finish TypeScript assignment", user1);

work.getNotes().forEach((n) =>
  console.log(`Note #${n.id} by userId ${n.userId} -> ${n.preview()}`)
);

// الأدمن يدير النوتس
admin.manageNotes(work, "list");
admin.manageNotes(work, "delete", 2);
admin.manageNotes(work, "list");

// Generics
const userStorage = new Storage<User>();
userStorage.addItem(user1);
userStorage.addItem(admin);
console.log("Users in storage:", userStorage.getAllItems().map((u) => u.name));

const numberStorage = new Storage<number>();
numberStorage.addItem(10);
numberStorage.addItem(20);
numberStorage.removeItem(10);
console.log("Numbers in storage:", numberStorage.getAllItems());

const noteStorage = new Storage<Note>();
work.getNotes().forEach((n) => noteStorage.addItem(n));
console.log("Notes in storage:", noteStorage.getAllItems().length);
