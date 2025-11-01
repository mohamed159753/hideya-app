import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';

interface Category {
  _id?: string;
  name: string;
}

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.css'
})
export class AdminCategoryComponent implements OnInit {
  categories: Category[] = [];
  categoryForm!: FormGroup;
  editingId: string | null = null;

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  initializeForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const categoryData = this.categoryForm.value;

    if (this.editingId) {
      // Update existing
      this.categoryService.update(this.editingId, categoryData).subscribe(() => {
        this.loadCategories();
        this.editingId = null;
        this.categoryForm.reset();
      });
    } else {
      // Add new
      this.categoryService.add(categoryData).subscribe(() => {
        this.loadCategories();
        this.categoryForm.reset();
      });
    }
  }

  onEdit(category: Category): void {
    this.categoryForm.patchValue({ name: category.name });
    this.editingId = category._id ?? null;
  }

  onDelete(id: string): void {
    this.categoryService.delete(id).subscribe(() => {
      this.loadCategories();
    });
  }

  onCancel(): void {
    this.categoryForm.reset();
    this.editingId = null;
  }
}
