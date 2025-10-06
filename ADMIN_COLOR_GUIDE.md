# 🎨 Admin Theme Color Reference Guide

## Current Admin Color Scheme

### Initiative Admin
```javascript
// Headers & Titles
text-teal-700     // Dark teal for headings
text-white        // White text on gradient backgrounds

// Buttons
Edit Button:
- Background: gradient from-indigo-500 to-cyan-500
- Text: text-white (FIXED)
- Hover: from-blue-600 to-cyan-600

Delete Button:
- Background: gradient from-red-500 to-pink-500
- Text: text-white (FIXED)
- Hover: from-red-600 to-pink-600

Save Button:
- Background: gradient from-yellow-300 via-orange-400 to-pink-500
- Text: text-black
- Border: border-white

// Form Sections
Teal Section (Basic Info):
- Border: border-teal-100
- Background: bg-teal-50/30
- Legend: text-teal-700
- Inputs: border-teal-200, bg-white, text-gray-800

Blue Section (Content):
- Border: border-blue-100
- Background: bg-blue-50/30
- Legend: text-blue-700
- Inputs: border-blue-200, bg-white, text-gray-800

Purple Section (Impact):
- Border: border-purple-100
- Background: bg-purple-50/30
- Legend: text-purple-700
- Inputs: border-purple-200, bg-white, text-gray-800

Green Section (Features):
- Border: border-green-100
- Background: bg-green-50/30
- Legend: text-green-700
- Inputs: border-green-200, bg-white

Cyan Section (Media):
- Border: border-cyan-100
- Background: bg-cyan-50/30
- Legend: text-cyan-700
- Inputs: border-cyan-200, bg-white, text-gray-800
```

### Error States
```javascript
// Error Borders
border-red-500    // Red border for invalid fields

// Error Text
text-red-500      // For error messages
text-red-600      // For error descriptions
text-red-700      // For error headers

// Error Backgrounds
bg-red-50         // Light red background for error banner
border-red-200    // Border for error banner
```

### Success/Valid States
```javascript
// Valid Inputs
border-teal-200   // Normal state
focus:ring-teal-500  // When focused
focus:border-teal-500

// Hover States
hover:border-teal-300
hover:bg-teal-50
```

---

## Color Contrast Checklist

### ✅ Good Contrast (After Fixes)
- White text on teal gradient backgrounds
- White text on colored buttons (Edit, Delete)
- Black text on light gradient buttons (Save)
- Dark text on white input backgrounds
- Red error text on white backgrounds

### ❌ Poor Contrast (Fixed)
- ~~Indigo-600 text on gradient backgrounds~~ → Changed to white
- ~~White placeholders on light backgrounds~~ → Changed to gray-400

---

## Recommended Color Usage

### For Text on Colored Backgrounds:
```javascript
// Light backgrounds (white, 50 shades)
text-gray-800, text-gray-900, text-[color]-700

// Medium backgrounds (100-300 shades)
text-gray-700, text-[color]-800

// Dark backgrounds (400+ shades, gradients)
text-white, text-gray-100

// Gradients
text-white (safest)
```

### For Borders:
```javascript
// Normal state
border-[color]-200

// Hover state
hover:border-[color]-300

// Focus state
focus:border-[color]-500

// Error state
border-red-500
```

### For Backgrounds:
```javascript
// Form sections
bg-[color]-50/30 (30% opacity)

// Cards
bg-white, bg-gradient-to-br from-white via-[color]-50

// Buttons
bg-gradient-to-r from-[color]-500 to-[color2]-500

// Hover
hover:bg-[color]-100
```

---

## Other Admin Components

### Events Admin
```javascript
Primary Color: Orange
- Headers: text-orange-700
- Buttons: gradient from-pink-500 via-indigo-500 to-blue-500
- Button Text: text-black (may need to change to text-white)
- Form Fields: border-orange-200
```

### Gallery Admin
```javascript
Primary Color: Blue
- Headers: text-blue-800
- Buttons: gradient from-pink-500 via-indigo-500 to-blue-500
- Button Text: text-black (may need to change to text-white)
- Form Fields: border-blue-200
```

### Hero/About Admin
```javascript
Primary Color: Purple
- Headers: text-purple-700
- Buttons: gradient from-yellow-400 to-pink-500
- Form Fields: border-purple-200
```

---

## Quick Fix Template

If you encounter white text on white background:

1. **Identify the element**
   ```javascript
   // Find code like this:
   className="... text-indigo-600 bg-gradient-to-r ..."
   ```

2. **Change text color**
   ```javascript
   // Change to:
   className="... text-white bg-gradient-to-r ..."
   ```

3. **Test contrast**
   - Check in browser
   - Verify text is readable
   - Test hover states

---

## Accessibility Guidelines

### WCAG AA Standards (Minimum)
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### Good Combinations:
- ✅ text-white on bg-teal-600+
- ✅ text-gray-900 on bg-white
- ✅ text-gray-800 on bg-gray-50
- ✅ text-red-500 on bg-white
- ✅ text-white on gradient backgrounds

### Poor Combinations:
- ❌ text-indigo-600 on gradient backgrounds
- ❌ text-gray-300 on bg-gray-100
- ❌ text-yellow-400 on bg-white (too light)

---

## Testing Your Colors

1. **Visual Test**: Can you read it easily?
2. **Zoom Test**: Zoom to 200% - still readable?
3. **Grayscale Test**: Convert to grayscale - still distinguishable?
4. **Tool Test**: Use WebAIM Contrast Checker

Online Tools:
- https://webaim.org/resources/contrastchecker/
- https://coolors.co/contrast-checker

---

## Common Admin Color Patterns

### Header Section:
```javascript
<div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6">
  <h2 className="text-2xl font-extrabold text-white">
    Add New Initiative
  </h2>
  <p className="text-white mt-1">
    Description text
  </p>
</div>
```

### Card Section:
```javascript
<div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 border-2 border-teal-100 rounded-2xl p-6">
  <h3 className="font-extrabold text-lg text-teal-700">
    Card Title
  </h3>
  <p className="text-gray-700 text-sm">
    Card content
  </p>
</div>
```

### Form Field:
```javascript
<input
  className="w-full border-2 border-teal-200 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-gray-800 placeholder-gray-400"
/>
```

### Error Field:
```javascript
<input
  className={`w-full border-2 p-3 rounded-lg ${
    errors.field ? 'border-red-500' : 'border-teal-200'
  }`}
/>
{errors.field && (
  <p className="text-red-500 text-xs mt-1">⚠ {errors.field}</p>
)}
```

---

## Summary

**Remember:**
1. Always use `text-white` on dark gradient backgrounds
2. Always use `text-gray-800` or darker on light backgrounds
3. Test visibility before deploying
4. Use consistent color schemes across admin sections
5. Add proper error states with high contrast colors

**Color Hierarchy:**
- Primary Actions: Gradient buttons with white text
- Secondary Actions: Solid colors with white text
- Destructive Actions: Red gradients with white text
- Form Sections: Pastel backgrounds (50/30%) with dark text
- Input Fields: White background with dark text
