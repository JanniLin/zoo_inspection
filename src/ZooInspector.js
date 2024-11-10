'use strict'

export class ZooInspector {
  constructor(imageRecognitionSystem, inspectionLog) {
    this.imageRecognitionSystem = imageRecognitionSystem;
    this.inspectionLog = inspectionLog;
  }

  inspect(zoo) {
    const inspection = new Inspection(zoo, this.imageRecognitionSystem);
    inspection.runInspection();
    this.inspectionLog.log(inspection.inspectionStatuses);
  }
}

class Inspection {
  constructor(zoo, imageRecognitionSystem) {
    this.zoo = zoo;
    this.imageRecognitionSystem = imageRecognitionSystem;
    this.inspectionStatuses = [];
    this.zooWarningStatus = false;
  }

  runInspection() {
    this.inspectEnclosuresAndAnimals();
    this.reportZooStatus();
  }

  inspectEnclosuresAndAnimals() {
    this.zoo.getEnclosures().forEach(enclosure => {
      this.inspectEnclosure(enclosure);
      this.inspectAnimal(enclosure);
    });
  }

  reportZooStatus() {
    this.inspectionStatuses.push(`ZOO#${this.zoo.getId()}#${this.zooWarningStatus ? 'WARNING' : 'OK'}`);
  }

  inspectEnclosure(enclosure) {
    const enclosureImage = this.zoo.capturePictureOf(enclosure);
    const enclosureStatus = this.imageRecognitionSystem.recognizeEnclosureStatus(enclosure, enclosureImage);
    if (this.isNotSafeEnclosure(enclosureStatus)) {
      this.respondToNotSafeEnclosure(enclosure);
      this.reportNotSafeEnclosureStatus(enclosure);
    }
  }

  respondToNotSafeEnclosure(enclosure) {
    this.zoo.closeEnclosure(enclosure);
    this.zoo.requestSecurityTo(enclosure);
    this.zoo.requestMaintenanceCrewTo(enclosure);
  }

  reportNotSafeEnclosureStatus(enclosure) {
    this.addWarningToStatuses(enclosure, false);
    this.zooWarningStatus = true;
  }

  isNotSafeEnclosure(enclosureStatus) {
    return !enclosureStatus.isEnclosureSafe();
  }

  inspectAnimal(enclosure) {
    const animalImage = this.zoo.capturePictureOf(enclosure.getAnimal());
    const animalStatus = this.imageRecognitionSystem.recognizeAnimalStatus(enclosure.getAnimal(), animalImage);
    if (animalStatus.isAnimalSick()) {
      this.respondToSickAnimal(enclosure);
      this.reportSickAnimalStatus(enclosure);
    }
  }

  reportSickAnimalStatus(enclosure) {
    this.addWarningToStatuses(enclosure, true);
    this.zooWarningStatus = true;
  }

  respondToSickAnimal(enclosure) {
    this.zoo.closeEnclosure(enclosure);
    this.zoo.requestVeterinaryTo(enclosure.getAnimal());
  }

  addWarningToStatuses(enclosure, isAnimal) {
    this.inspectionStatuses.push(`${isAnimal ? 'ANIMAL' : 'ENCLOSURE'}#${isAnimal ? enclosure.getAnimal().getName() : enclosure.getId()}#WARNING`);
  }
}