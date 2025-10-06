# ✅ Testing Checklist - Fixed Issues

## Complete Testing Guide for Indraprasth Foundation Website

---

## 🎯 Test Environment
- **URL**: http://localhost:3001
- **Browser**: Chrome/Firefox/Safari (test all)
- **Screen Sizes**: Mobile (375px), Tablet (768px), Desktop (1920px)

---

## 1️⃣ Admin - Initiative Management

### Create New Initiative (Test Validation)

**Test Case 1.1: Empty Form Submission**
- [ ] Go to `/admin`
- [ ] Click "Initiatives" tab
- [ ] Click "Add New Initiative" button
- [ ] Click "Save Initiative" without filling anything
- [ ] **Expected**: 
  - Error banner appears at top
  - Red borders on required fields (title, slug, description, category)
  - Error messages appear below each field
  - Form does NOT submit

**Test Case 1.2: Invalid Slug Format**
- [ ] Fill title: "Test Initiative"
- [ ] Manually change slug to: "Test Initiative" (with spaces and caps)
- [ ] Click "Save Initiative"
- [ ] **Expected**:
  - Error message: "Slug can only contain lowercase letters, numbers, and hyphens"
  - Red border on slug field
  - Form does NOT submit

**Test Case 1.3: Auto-Slug Generation**
- [ ] Clear the form
- [ ] Type title: "Food Distribution Program"
- [ ] **Expected**:
  - Slug auto-fills as: "food-distribution-program"
  - Slug updates in real-time as you type title

**Test Case 1.4: Successful Form Submission**
- [ ] Fill all required fields:
  - Title: "Community Kitchen"
  - Slug: "community-kitchen" (auto-generated)
  - Category: "food-security"
  - Description: "Providing meals to those in need"
- [ ] Upload at least one main image
- [ ] Click "Save Initiative"
- [ ] **Expected**:
  - Loading spinner appears on button
  - Modal closes after save
  - New initiative appears in the list below
  - Image uploads successfully

### Edit Existing Initiative

**Test Case 1.5: Edit Initiative**
- [ ] Click "Edit" button on any initiative card
- [ ] Modal opens with pre-filled data
- [ ] Change title to: "Updated Initiative"
- [ ] **Expected**:
  - Slug updates automatically
  - All existing data is preserved
  - Can save changes successfully

**Test Case 1.6: Delete Image from Initiative**
- [ ] Edit an initiative with images
- [ ] Click "×" button on a main image
- [ ] **Expected**:
  - Confirmation dialog appears
  - Image is removed from the list
  - Can still save initiative

### Visual Checks

**Test Case 1.7: Button Text Visibility**
- [ ] Check "Edit" button on initiative cards
- [ ] Check "Delete" button on initiative cards
- [ ] **Expected**:
  - ✅ Text is WHITE (not indigo-600)
  - ✅ Text is clearly visible on gradient background
  - ✅ Hover states work correctly

**Test Case 1.8: Header Text Visibility**
- [ ] Check "Add New Initiative" section header
- [ ] **Expected**:
  - ✅ Title text is WHITE
  - ✅ Subtitle text is WHITE (not indigo-600)
  - ✅ All text is readable on teal gradient

---

## 2️⃣ Homepage - Initiative Display

### Image Loading

**Test Case 2.1: Single Image Initiative**
- [ ] Create initiative with 1 main image in admin
- [ ] Go to homepage (/)
- [ ] Scroll to "Key Initiatives" section
- [ ] **Expected**:
  - ✅ Image loads correctly
  - ✅ Image fits in card properly
  - ✅ No broken image icons
  - ✅ Hover effect works (slight zoom)

**Test Case 2.2: Multiple Images Initiative**
- [ ] Create initiative with 3 main images in admin
- [ ] Go to homepage
- [ ] **Expected**:
  - ✅ First image from array displays
  - ✅ Image is not distorted
  - ✅ Other images are accessible in admin

**Test Case 2.3: No Image Initiative**
- [ ] Create initiative without any images
- [ ] Go to homepage
- [ ] **Expected**:
  - ✅ Fallback image displays based on category
  - ✅ No error in console
  - ✅ Card still looks complete

### Title & Impact Display

**Test Case 2.4: Title Display**
- [ ] Check all initiative cards on homepage
- [ ] **Expected**:
  - ✅ Title shows correctly (not "undefined")
  - ✅ Supports both "title" and "name" fields
  - ✅ Text is readable (dark gray on light background)

**Test Case 2.5: Impact Badge Display**
- [ ] Check impact badge on each initiative card
- [ ] **Expected**:
  - ✅ Shows formatted text like "200,000+ Meals Served"
  - ✅ No "undefined" text
  - ✅ Falls back to "Making Impact" if data missing
  - ✅ Green badge is visible in bottom-right corner

**Test Case 2.6: Category Badge**
- [ ] Check category badge on each card
- [ ] **Expected**:
  - ✅ Category displays in top-left corner
  - ✅ Format: "Food Security" (properly capitalized, spaces instead of hyphens)
  - ✅ White background with dark text (readable)

---

## 3️⃣ Form Validation & Error Messages

### Real-time Validation

**Test Case 3.1: Error Clearing**
- [ ] Submit empty form to trigger errors
- [ ] Start typing in "Title" field
- [ ] **Expected**:
  - ✅ Red border disappears as you type
  - ✅ Error message below field disappears
  - ✅ Error banner stays until all errors fixed

**Test Case 3.2: Field-Specific Errors**
- [ ] Test each required field individually
- [ ] **Expected**:
  - Title: "Title is required"
  - Slug: "Slug is required" or format error
  - Description: "Short description is required"
  - Category: "Category is required"

**Test Case 3.3: Error Banner**
- [ ] Submit form with multiple errors
- [ ] **Expected**:
  - ✅ Red banner appears at top of form
  - ✅ Shows icon and message
  - ✅ Has close button (×)
  - ✅ Can dismiss banner
  - ✅ Banner reappears on next failed submit

### Tooltips & Help Text

**Test Case 3.4: Category Tooltip**
- [ ] Check category field label
- [ ] **Expected**:
  - ✅ Shows: "Category * (lowercase with hyphens, e.g., food-security, education, healthcare)"
  - ✅ Tooltip is visible and readable
  - ✅ Helps user understand format

**Test Case 3.5: Required Field Markers**
- [ ] Check all form fields
- [ ] **Expected**:
  - ✅ Required fields have asterisk (*)
  - ✅ Placeholders show example format
  - ✅ Optional fields don't have asterisk

---

## 4️⃣ Data Integrity

### Database Storage

**Test Case 4.1: Firestore Data Structure**
- [ ] Create a new initiative
- [ ] Check Firestore console
- [ ] Verify structure:
```javascript
{
  title: "string",
  slug: "string",
  description: "string",
  longDescription: "string",
  category: "string",
  imageUrl: ["array", "of", "urls"],  // Note: Array, not string
  gallery: [{ url: "string", caption: "" }],
  impact: {
    number: "string",
    metric: "string",
    description: "string"
  },
  features: ["array", "of", "strings"],
  featured: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Test Case 4.2: Image URL Storage**
- [ ] Upload 2 main images
- [ ] Check Firestore
- [ ] **Expected**:
  - ✅ `imageUrl` is an ARRAY of URLs
  - ✅ Each URL is a valid Firebase Storage URL
  - ✅ URLs are accessible (not 404)

---

## 5️⃣ Cross-Browser Testing

### Browser Compatibility

**Test Case 5.1: Chrome**
- [ ] All tests pass in Chrome
- [ ] Images load correctly
- [ ] Forms submit properly
- [ ] No console errors

**Test Case 5.2: Firefox**
- [ ] All tests pass in Firefox
- [ ] Visual appearance consistent
- [ ] Validation works correctly

**Test Case 5.3: Safari**
- [ ] All tests pass in Safari
- [ ] Gradient backgrounds render correctly
- [ ] Image uploads work

---

## 6️⃣ Mobile Responsiveness

### Mobile View (375px - 767px)

**Test Case 6.1: Admin on Mobile**
- [ ] Open admin on mobile device/emulator
- [ ] **Expected**:
  - ✅ Form fields are full width
  - ✅ Text is readable (not too small)
  - ✅ Buttons are touch-friendly (min 44x44px)
  - ✅ Modal scrolls properly
  - ✅ Bottom nav appears

**Test Case 6.2: Homepage on Mobile**
- [ ] Open homepage on mobile
- [ ] **Expected**:
  - ✅ Initiative cards stack vertically
  - ✅ Images scale properly
  - ✅ Text is readable
  - ✅ Bottom nav shows correct page

---

## 7️⃣ Performance Testing

### Load Times

**Test Case 7.1: Initial Page Load**
- [ ] Clear cache
- [ ] Load homepage
- [ ] **Expected**:
  - ✅ Page loads in < 3 seconds
  - ✅ Images lazy load
  - ✅ No layout shift

**Test Case 7.2: Admin Load**
- [ ] Load admin dashboard
- [ ] **Expected**:
  - ✅ Loads in < 2 seconds
  - ✅ Shows loading spinner while fetching data
  - ✅ Smooth transitions

**Test Case 7.3: Image Upload**
- [ ] Upload 5 images at once
- [ ] **Expected**:
  - ✅ Progress indicator shows
  - ✅ Completes in reasonable time
  - ✅ No timeout errors

---

## 8️⃣ Error Handling

### Network Errors

**Test Case 8.1: Offline Submission**
- [ ] Go offline (disable network)
- [ ] Try to submit form
- [ ] **Expected**:
  - ✅ Error message displays
  - ✅ User-friendly error text
  - ✅ Form data not lost

**Test Case 8.2: Firebase Errors**
- [ ] Submit with invalid Firebase config
- [ ] **Expected**:
  - ✅ Error caught gracefully
  - ✅ Console shows error details
  - ✅ User sees friendly error message

---

## 9️⃣ User Experience

### Feedback & Confirmations

**Test Case 9.1: Delete Confirmation**
- [ ] Click delete on an initiative
- [ ] **Expected**:
  - ✅ Confirmation dialog appears
  - ✅ Can cancel deletion
  - ✅ Can confirm deletion
  - ✅ Item removed after confirmation

**Test Case 9.2: Loading States**
- [ ] Submit form
- [ ] **Expected**:
  - ✅ Button shows loading spinner
  - ✅ Button text changes to "Processing..."
  - ✅ Button is disabled during submission
  - ✅ Form inputs are still visible

---

## 🐛 Bug Report Template

If you find an issue:

```markdown
**Issue**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: Chrome/Firefox/Safari
**Screen Size**: Desktop/Mobile
**Console Errors**: [Copy any error messages]
**Screenshot**: [If applicable]
```

---

## ✅ Sign-Off Checklist

Before considering fixes complete:

- [ ] All admin buttons have visible white text
- [ ] Initiative images load correctly on homepage (both single and array)
- [ ] Form validation works with proper error messages
- [ ] Required fields are marked with *
- [ ] Tooltips provide helpful context
- [ ] Impact badges display correctly
- [ ] Title displays correctly (supports both title and name)
- [ ] Error messages are user-friendly
- [ ] Real-time validation clears errors
- [ ] Slug auto-generates from title
- [ ] Can create, edit, and delete initiatives
- [ ] Images upload successfully
- [ ] Mobile view works properly
- [ ] No console errors on any page
- [ ] All test cases pass

---

## 📊 Test Results Log

| Test Case | Status | Notes | Tester | Date |
|-----------|--------|-------|--------|------|
| 1.1 | ⏳ Pending | | | |
| 1.2 | ⏳ Pending | | | |
| 1.3 | ⏳ Pending | | | |
| 1.4 | ⏳ Pending | | | |
| ... | | | | |

**Status Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Issues Found

---

**Testing Priority:**
1. **Critical**: Test Cases 1.7, 1.8, 2.1, 2.4, 2.5 (visibility issues)
2. **High**: Test Cases 1.1-1.6, 3.1-3.3 (validation)
3. **Medium**: Test Cases 4.1, 4.2, 5.1-5.3 (data integrity)
4. **Low**: Test Cases 7.1-7.3 (performance)

**Estimated Testing Time**: 45-60 minutes for complete suite
