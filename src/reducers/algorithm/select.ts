// select i'th largest element of array between left and right
const select = (array, i, left, right) => {
    if(left === right) {
        return left
    }

    const q = findPivotPosition(array, left, right)

    swap(array, q, right)

    const qq = partition(array, left, right)


    if(i === qq) {
        return qq
    } else if(i < qq) {
        return select(array, i, left, qq-1)
    } else {
        return select(array, i, qq+1, right)
    }
}

const swap = (array, a, b) => {
    const aE = array[a]
    const bE = array[b]
    array[b] = aE
    array[a] = bE
}

const partition = (array, left, right) => {
    const pivot = array[right];
    let i = left-1;
    let j=left
    for(;j < right; j++) {
      if (array[j] < pivot) {
        swap(array, ++i, j)
      }
    }
    swap(array, ++i, j);
    return i;
}

const findPivotPosition = (array, left, right) => {
    const n = right - left + 1
    const ceil = Math.ceil(n / 5)
    const means = Array(ceil).fill(null)

    for(let i = 0;i < ceil; i++) {
        insertionSort(array, left + 5*i, Math.min(left + 5*i + 5, right))
        means[i] = array[Math.min(left + 5*i + 2, right)]
    }

    const x = select(means, Math.floor(ceil / 2), 0, ceil - 1)
    return Math.min(left + 5*x + 2, right)
}

const insertionSort = (array, left, right) => {
    for(let i = 1; i<array.length; i++) {
        for(let j=i;j>0&&array[j-1] > array[j];j--) {
            swap(array, i, j-1)
        }
    }
}

export default select
