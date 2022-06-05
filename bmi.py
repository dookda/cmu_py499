from re import X


def mbmi(w, h):
    res = int(w) / int(int(h/100) ^ 2)

    if(res <= 18.5):
        return f'ต่ำกว่าเกณฑ์ ({round(res, 2)})'
    elif(res <= 22.9):
        return f'สมส่วน ({round(res, 2)})'
    elif(res <= 24.9):
        return f'น้ำหนักเกิน ({round(res, 2)})'
    elif(res <= 29.9):
        return f'อ้วน ({round(res, 2)})'
    else:
        return f'อ้วนมาก ({round(res, 2)})'


def wbmi(w, h):
    res = int(w) / int(int(h/100) ^ 2)

    if(res <= 18.5):
        return f'ต่ำกว่าเกณฑ์ ({round(res, 2)})'
    elif(res <= 22.9):
        return f'สมส่วน ({round(res, 2)})'
    elif(res <= 24.9):
        return f'น้ำหนักเกิน ({round(res, 2)})'
    elif(res <= 29.9):
        return f'อ้วน ({round(res, 2)})'
    else:
        return f'อ้วนมาก ({round(res, 2)})'


w = input("กรอกน้ำหนัก: ")
h = input("กรอกส่วนสูง: ")
sex = input("เพศ: ")

if(sex == "ชาย"):
    a = mbmi(int(w), int(h))
    print(f'คุณ{a}')
else:
    a = wbmi(int(w), int(h))
    print(f'คุณ{a}')
