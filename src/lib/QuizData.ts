import {QuizDataGroupObject, QuizDataObject} from './types.ts'
import QuizDataGroup from './QuizDataGroup.ts'

class QuizData {
  name: string
  groups: QuizDataGroup[]
  groupsCount: number

  constructor(alphabet: QuizDataObject) {
    this.name = ''
    this.groups = []
    this.groupsCount = 0

    this.initGroups(alphabet.groups)
  }

  getGroup(index: number) {
    return this.groups[index]
  }

  toObject() {
    return {
      name: this.name,
      groups: this.groups.map((group) => {
        return group.toObject()
      })
    }
  }

  addGroup(group: QuizDataGroupObject, index: number) {
    this.groups.push(new QuizDataGroup(index, group))
    this.groupsCount++
  }

  initGroups(groups: QuizDataGroupObject[]) {
    groups.forEach(this.addGroup.bind(this))
  }
}

export default QuizData
