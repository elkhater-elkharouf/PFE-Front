import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";

import { Subject, from } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { Email } from "app/main/apps/email/email.model";
import { EmailService } from "app/main/apps/email/email.service";
import { UserService } from "services/user.service";
import * as XLSX from "xlsx"
import { ToastrService } from "ngx-toastr";
import * as bootstrap from 'bootstrap';
import tinymce from "tinymce";
@Component({
  selector: "email-list-item",
  templateUrl: "./email-list-item.component.html",
  encapsulation: ViewEncapsulation.None,
})
export class EmailListItemComponent implements OnInit, AfterViewInit{
  editorContent: string = '<p>Initial content</p>';
  editorConfig = {

    menubar: 'favs file edit view insert format tools table help',
    menu: {
      favs: { title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons' }
    },
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media',
      'table', 'emoticons', 'help'
      ],
      
      height: 300,
    toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
    'forecolor backcolor emoticons | help ',
    automatic_uploads: true,
    images_upload_handler:  (blobInfo, success, failure) => this.uploadImage(blobInfo, success, failure), // Add this handler
    file_picker_types: 'image',
    paste_data_images: true,
    insertdatetime_formats: [ '%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D' ],
    insertdatetime_element: true,
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
  };

  onEditorChange(content:any) {
    this.editorContent = content;
  }



  ExcelData :any 
  displayedColumns: string[] = [];
  editingCell: { rowIndex: number, colIndex: number } | null = null;
  // Public
  public selected;

  selectedFileType = "word";
  fileAccept = ".doc,.docx";
  generalFile: File | null = null;
  excelFile: File | null = null;
  // Private
  private _unsubscribeAll: Subject<any>;

  // Input Decorator
  @Input() email: Email;

  constructor(
    private _emailService: EmailService,
    private _userService: UserService,
    private elementRef: ElementRef,
    private toastr: ToastrService
  ) {
    this._unsubscribeAll = new Subject();
    
  }

  uploadImage(blobInfo, success, failure) {
    const file = blobInfo.blob();
    this._userService.TelechargerImage(file).subscribe({
      next: (response: any) => {
        // Assuming the response contains the URL of the uploaded image
        success(response.imagenUrl); // Ensure success callback is called with URL
      },
      error: (err: any) => {
        failure('Image upload failed: ' + err.message); // Ensure failure callback is called with an error message
      }
    });
  }
  
  ngAfterViewInit(): void {
   
    
    const allUsersElement = this.elementRef.nativeElement.querySelector('#allUsers');
    const byProjectElement = this.elementRef.nativeElement.querySelector('#byProject');
    const departmentMCElement = this.elementRef.nativeElement.querySelector('#departmentMC');
    const departmentSEElement = this.elementRef.nativeElement.querySelector('#departmentSE');
    const departmentFinanceElement = this.elementRef.nativeElement.querySelector('#departmentFinance');
  
    if (allUsersElement) {
      allUsersElement.addEventListener('click', (event) => {
        event.preventDefault();
        const url = 'http://localhost:9999/USER-SERVICE/export/Allusers';
        window.location.href = url;
      });
    }
  

    if (byProjectElement) {
      byProjectElement.addEventListener('click', (event) => {
        event.preventDefault();
        const url = '/apps/e-commerce/wishlist';
        window.location.href = url;
      });
    }
  
    const handleDepartmentExport = (department: string) => {
      const url = `http://localhost:9999/USER-SERVICE/export/users/${department}`;
      window.location.href = url;
    };
  
    if (departmentMCElement) {
      departmentMCElement.addEventListener('click', (event) => {
        event.preventDefault();
        handleDepartmentExport('MC');
      });
    }
  
    if (departmentSEElement) {
      departmentSEElement.addEventListener('click', (event) => {
        event.preventDefault();
        handleDepartmentExport('SE');
      });
    }
  
    if (departmentFinanceElement) {
      departmentFinanceElement.addEventListener('click', (event) => {
        event.preventDefault();
        handleDepartmentExport('Finance');
      });
    }
  
  

}


  onSelectedChange() {
    this._emailService.toggleSelectedMail(this.email.id);
  }

  /**
   * Toggle Starred
   */
  toggleStarred() {
    this._emailService.toggleStarred(this.email);
  }

  onFileSelect(event: Event, fileType: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (fileType === "general") {
        this.generalFile = file;
      } else if (fileType === "excel") {
        this.excelFile = file;
      }
    }
  }
  openModal() {
    const modal = new bootstrap.Modal(document.getElementById('excelModal'));
    modal.show();
  }
  updateFileAccept(): void {
    this.fileAccept =
      this.selectedFileType === "word" ? ".doc,.docx" : ".ppt,.pptx";
  }

  canSubmit(): boolean {
    return this.generalFile !== null && this.excelFile !== null;
  }
  onSubmit(): void {
    if (!this.canSubmit()) {
      alert("Please upload both files.");
      return;
    }

    const formData = new FormData();
    let fileName = "";
 // Ajouter les données Excel modifiées en tant que fichier Blob
 const ws = XLSX.utils.json_to_sheet(this.ExcelData);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
 const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });

 formData.append("excelFile", blob, 'modifiedExcel.xlsx');
    formData.append("excelFile", this.excelFile);

    if (this.selectedFileType === "word") {
      fileName = "wordTemplate";
    } else if (this.selectedFileType === "ppt") {
      fileName = "pptTTemplate";
    }

    formData.append(fileName, this.generalFile);

    this._userService
      .exportFileFromExcel(formData, this.selectedFileType)
      .subscribe({
        next: () => {
          console.log("File conversion successful");
          
        },
        error: (error) => {
          console.error("Error during file conversion:", error);
          alert("Failed to convert file.");
        },
        complete: () => {
          console.log("File conversion process completed.");
        },
      });
      
  }

  async ReadExcel(event: any) {
    try {
      const file = event.target.files[0];
      if (!file) {
        console.error('Aucun fichier sélectionné.');
        return;
      }
    
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        console.error('Le fichier sélectionné n\'est pas un fichier Excel valide.');
        return;
      }
    
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(file);
    
      const fileData = await new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = (error) => reject(error);
      });
    
      const workBook = XLSX.read(fileData, { type: 'binary' });
      const sheetNames = workBook.SheetNames;
      this.ExcelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);
    
      if (this.ExcelData.length > 0) {
        this.displayedColumns = Object.keys(this.ExcelData[0]);
      }
    
      console.log(this.ExcelData);
        // Sauvegarder les données modifiées dans le local storage
    this.saveExcelToLocalStorage(workBook);
    } catch (error) {
      console.error('Une erreur est survenue lors de la lecture du fichier Excel :', error);
    }
  }
  
  saveExcelToLocalStorage(workBook: XLSX.WorkBook): void {
    const wbout = XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      localStorage.setItem('modifiedExcelBlob', reader.result as string);
      console.log('Fichier Excel sauvegardé localement.');
    };
  }
  
  s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
  saveChanges(): void {
    const ws = XLSX.utils.json_to_sheet(this.ExcelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    this.saveExcelToLocalStorage(wb);
    this.toastr.success('Les modifications ont été enregistrées localement.');
  }
promptAddColumn() {
  let newCol = prompt("Enter the name of the new column:");
  if (newCol) {
    this.addColumn(newCol);
  }
}

addColumn(newCol: string) {
  this.ExcelData.forEach(row => {
    row[newCol] = 'null'; // Ajoute une colonne vide pour chaque ligne existante
  });
  this.displayedColumns.push(newCol);
  this.ExcelData.forEach((row, rowIndex) => {
    this.startEdit(row, rowIndex, this.displayedColumns.length - 1); // Permettre l'édition immédiate de la nouvelle colonne
  });

  this.saveChanges(); // Sauvegarder les modifications
}

addEmptyRow() {
  let newRow: any = {};
  this.displayedColumns.forEach(col => {
    newRow[col] = 'null'; // Ajoute une colonne vide pour chaque colonne existante
  });
  this.addRow(newRow);
  this.startEdit(newRow, this.ExcelData.length - 1, this.ExcelData.length); // Permettre l'édition immédiate de la première cellule de la nouvelle ligne
  this.saveChanges(); // Sauvegarder les modifications
}

addRow(newRow: any) {
  this.ExcelData.push(newRow);
}

startEdit(data: any, rowIndex: number, colIndex: number) {
  this.editingCell = { rowIndex, colIndex }; // Mettre à jour la cellule en cours d'édition
}

stopEdit() {
  this.editingCell = null; // Arrêter l'édition en réinitialisant la cellule en cours d'édition
  this.saveChanges(); // Sauvegarder les modifications
}

isEditingCell(rowIndex: number, colIndex: number): boolean {
  return this.editingCell && this.editingCell.rowIndex === rowIndex && this.editingCell.colIndex === colIndex;
}

calculateInputWidth(value: any): number {
  if (typeof value === 'string') {
    return value.length * 10; // Ajuster la largeur en fonction de la longueur du texte
  } else if (typeof value === 'number') {
    return 50 + value.toString().length * 10; // Si la valeur est un nombre, la largeur dépend de sa taille
  } else {
    return 100; // Par défaut, retourner une largeur fixe
  }
}


  ngOnInit(): void {

    const savedExcelBlob = localStorage.getItem('modifiedExcelBlob');
    if (savedExcelBlob) {
      this.loadExcelFromLocalStorage(savedExcelBlob);
    }

    // Subscribe to update on selected email change
    this._emailService.onSelectedEmailsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((selectedMails) => {
        this.selected = false;

        if (selectedMails.length > 0) {
          for (const email of selectedMails) {
            if (email.id === this.email.id) {
              this.selected = true;
              break;
            }
          }
        }
      });

  }
  loadExcelFromLocalStorage(dataUrl: string): void {
  fetch(dataUrl)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workBook = XLSX.read(data, { type: 'array' });
      const sheetNames = workBook.SheetNames;
      this.ExcelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);

      if (this.ExcelData.length > 0) {
        this.displayedColumns = Object.keys(this.ExcelData[0]);
      }

      console.log('Fichier Excel chargé à partir du stockage local.');
    })
    .catch(error => {
      console.error('Erreur lors du chargement du fichier Excel à partir du stockage local :', error);
    });
}

  /**
   * On destroy
   */

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
